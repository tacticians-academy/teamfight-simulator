import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import itemEffects from '#/data/items'

import { state } from '#/game/store'
import { updatePaths } from '#/game/pathfind'

import { uniqueIdentifier } from '#/helpers/utils'

const GAME_TICK_MS = 1000 / 30

let frameID: number | null = null
let startedAtMS: DOMHighResTimeStamp = 0
let previousFrameMS: DOMHighResTimeStamp = 0

const MOVE_LOCKOUT_JUMPERS_MS = 500
const MOVE_LOCKOUT_MELEE_MS = 1000

let didBacklineJump = false

function requestNextFrame(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	if (unanimated === true) {
		runLoop(frameMS + GAME_TICK_MS, true)
	} else {
		frameID = window.requestAnimationFrame(runLoop)
	}
}
export function runLoop(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	let diffMS = frameMS - previousFrameMS
	if (diffMS < GAME_TICK_MS - 1) {
		requestNextFrame(frameMS, unanimated)
		return
	}
	const isFirstLoop = !startedAtMS
	if (isFirstLoop) {
		diffMS = 0
		previousFrameMS = frameMS
		startedAtMS = frameMS
		updatePaths(state.units)
		didBacklineJump = false
		state.units.forEach(unit => {
			unit.shields.forEach(shield => {
				shield.activated = shield.activatesAtMS == null
				if (shield.repeatsEveryMS != null) {
					shield.repeatAmount = shield.amount
				}
			})
		})
	}
	const elapsedMS = frameMS - startedAtMS
	if (elapsedMS >= MOVE_LOCKOUT_JUMPERS_MS) {
		didBacklineJump = true
	}

	for (const unit of state.units) {
		if (unit.dead) {
			continue
		}
		unit.updateRegen(elapsedMS)
		unit.updateShields(elapsedMS)
		unit.updateStatusEffects(elapsedMS)
		if (unit.banishUntilMS != null && unit.banishUntilMS <= elapsedMS) {
			unit.banishUntil(null)
		}
		unit.items.forEach((item, index) => {
			itemEffects[item.id as ItemKey]?.update?.(elapsedMS, item, uniqueIdentifier(index, item), unit)
		})
	}

	for (const unit of state.units) {
		if (unit.dead || unit.isMoving(elapsedMS) || unit.range() <= 0 || unit.stunnedUntilMS > elapsedMS || !unit.interacts) {
			continue
		}

		for (const pendingHexEffect of unit.pending.hexEffects) {
			if (elapsedMS >= pendingHexEffect.startsAtMS) {
				state.hexEffects.add(pendingHexEffect)
				unit.pending.hexEffects.delete(pendingHexEffect)
			}
		}
		for (const pendingProjectile of unit.pending.projectiles) {
			if (elapsedMS >= pendingProjectile.startsAtMS) {
				state.projectiles.add(pendingProjectile)
				unit.pending.projectiles.delete(pendingProjectile)
			}
		}
		if (didBacklineJump) {
			unit.updateTarget()
		}
		if (didBacklineJump && unit.readyToCast()) {
			unit.castAbility(elapsedMS)
		} else if (unit.target) {
			unit.updateAttack(elapsedMS)
		} else {
			if (elapsedMS < MOVE_LOCKOUT_MELEE_MS) {
				if (!didBacklineJump) {
					if (!unit.jumpsToBackline()) {
						continue
					}
					unit.jumpToBackline(elapsedMS)
					continue
				} else if (unit.range() > 1) {
					continue
				}
			}
			unit.updateMove(elapsedMS)
		}
	}

	state.hexEffects.forEach(hexEffect => {
		if (!hexEffect.update(elapsedMS, state.units)) {
			state.hexEffects.delete(hexEffect)
		}
	})
	state.projectiles.forEach(projectile => {
		if (!projectile.update(elapsedMS, diffMS)) {
			state.projectiles.delete(projectile)
		}
	})

	if (isFirstLoop) {
		updatePaths(state.units)
	}

	previousFrameMS = frameMS
	requestNextFrame(frameMS, unanimated)
}

export function cancelLoop() {
	startedAtMS = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
