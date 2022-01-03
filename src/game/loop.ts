let frameID: number | null = null

import { useStore } from '#/game/store'
import { updatePaths } from '#/game/pathfind'
import { hexEffects } from '#/data/set6/abilities'

const { state, gameOver } = useStore()

let startedAtMS: DOMHighResTimeStamp = 0

const MOVE_LOCKOUT_JUMPERS_MS = 500
const MOVE_LOCKOUT_MELEE_MS = 1000

let didBacklineJump = false

function applyPendingHexEffects(elapsedMS: DOMHighResTimeStamp) {
	for (let index = hexEffects.length - 1; index >= 0; index -= 1) {
		const hexEffect = hexEffects[index]
		if (elapsedMS < hexEffect.activatesAtMS) {
			continue
		}
		const affectingUnits = hexEffect.targetTeam === 2 ? state.units : state.units.filter(unit => unit.team === hexEffect.targetTeam)
		for (const unit of affectingUnits.filter(unit => unit.isIn(hexEffect.hexes))) {
			if (hexEffect.damage != null) {
				unit.damage(elapsedMS, hexEffect.damage, hexEffect.damageType!, hexEffect.source, state.units, gameOver)
			}
			if (hexEffect.stunDuration != null) {
				unit.stunnedUntilMS = Math.max(unit.stunnedUntilMS, elapsedMS + hexEffect.stunDuration)
			}
		}
		hexEffects.splice(index, 1)
	}
}

export function runLoop(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	const isFirstLoop = !startedAtMS
	if (isFirstLoop) {
		startedAtMS = frameMS
		updatePaths(state.units)
		didBacklineJump = false
	}
	const elapsedMS = frameMS - startedAtMS
	if (elapsedMS >= MOVE_LOCKOUT_JUMPERS_MS) {
		didBacklineJump = true
	}
	applyPendingHexEffects(elapsedMS)

	for (const unit of state.units) {
		if (unit.dead || unit.isMoving(elapsedMS) || unit.range() <= 0 || unit.stunnedUntilMS > elapsedMS) {
			continue
		}
		if (unit.readyToCast()) {
			unit.castAbility(elapsedMS)
		}
		if (didBacklineJump) {
			unit.updateTarget(state.units)
		}
		if (unit.target) {
			unit.updateAttack(elapsedMS, state.units, gameOver)
		} else {
			if (elapsedMS < MOVE_LOCKOUT_MELEE_MS) {
				if (!didBacklineJump) {
					if (!unit.jumpsToBackline()) {
						continue
					}
					unit.jumpToBackline(elapsedMS, state.units)
					continue
				} else if (unit.range() > 1) {
					continue
				}
			}
			unit.updateMove(elapsedMS, state.units)
		}
	}
	if (isFirstLoop) {
		updatePaths(state.units)
	}

	if (unanimated === true) {
		runLoop(frameMS + 60, true)
	} else {
		frameID = window.requestAnimationFrame(runLoop)
	}
}

export function cancelLoop() {
	startedAtMS = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
