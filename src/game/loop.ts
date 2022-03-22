import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import itemEffects from '#/data/items'
import traitEffects from '#/data/set6/traits'

import type { GameEffect, GameEffectChild } from '#/game/GameEffect'
import { needsPathfindingUpdate, updatePathsIfNeeded } from '#/game/pathfind'
import { getters, state } from '#/game/store'

import { getAliveUnitsOfTeamWithTrait } from '#/helpers/abilityUtils'
import type { TeamNumber } from '#/helpers/types'
import { uniqueIdentifier } from '#/helpers/utils'

const GAME_TICK_MS = 1000 / 30

let frameID: number | null = null
let startedAtMS: DOMHighResTimeStamp = 0
let previousFrameMS: DOMHighResTimeStamp = 0

const MOVE_LOCKOUT_JUMPERS_MS = 500
const MOVE_LOCKOUT_MELEE_MS = 1000

let didBacklineJump = false
let didMeleeMove = false

function requestNextFrame(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	if (unanimated === true) {
		runLoop(frameMS + GAME_TICK_MS, true)
	} else {
		frameID = window.requestAnimationFrame(runLoop)
	}
}
export function runLoop(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	if (previousFrameMS === 0) {
		previousFrameMS = frameMS
		startedAtMS = frameMS
		needsPathfindingUpdate()
		updatePathsIfNeeded(state.units)
		didBacklineJump = false
		didMeleeMove = false
		state.units.forEach(unit => {
			if (unit.jumpsToBackline()) {
				unit.jumpToBackline(0)
			}
			unit.shields.forEach(shield => {
				shield.activated = shield.activatesAtMS == null
				const healShieldBoost = shield.source?.getBonuses(BonusKey.HealShieldBoost)
				if (shield.amount && healShieldBoost != null) {
					shield.amount *= (1 + healShieldBoost)
				}
				if (shield.repeatsEveryMS != null) {
					shield.repeatAmount = shield.amount
				}
			})
		})
		requestNextFrame(frameMS, unanimated)
		return
	}
	const diffMS = frameMS - previousFrameMS
	if (diffMS < GAME_TICK_MS - 1) {
		requestNextFrame(frameMS, unanimated)
		return
	}
	const elapsedMS = frameMS - startedAtMS

	getters.synergiesByTeam.value.forEach((teamSynergies, teamNumber) => {
		teamSynergies.forEach(({ key, activeEffect }) => {
			if (activeEffect) {
				const updateFn = traitEffects[key]?.update
				if (updateFn) {
					updateFn(activeEffect, elapsedMS, getAliveUnitsOfTeamWithTrait(teamNumber as TeamNumber, key))
				}
			}
		})
	})

	if (!didMeleeMove && elapsedMS >= MOVE_LOCKOUT_MELEE_MS) {
		didMeleeMove = true
	} else if (!didBacklineJump && elapsedMS >= MOVE_LOCKOUT_JUMPERS_MS) {
		didBacklineJump = true
	}
	for (const unit of state.units) {
		if (unit.dead) {
			continue
		}
		unit.updateBleeds(elapsedMS)
		unit.updateBonuses(elapsedMS)
		unit.updateRegen(elapsedMS)
		unit.updateShields(elapsedMS)
		unit.updateStatusEffects(elapsedMS)
		unit.items.forEach((item, index) => {
			itemEffects[item.id as ItemKey]?.update?.(elapsedMS, item, uniqueIdentifier(index, item), unit)
		})
		for (const pendingBonus of unit.pending.bonuses) {
			const [startsAtMS, pendingKey, bonuses] = pendingBonus
			if (elapsedMS >= startsAtMS) {
				unit.addBonuses(pendingKey, ...bonuses)
				unit.pending.bonuses.delete(pendingBonus)
			}
		}
	}

	for (const unit of state.units) {
		if (!unit.isInteractable()) {
			continue
		}
		if (didBacklineJump) {
			unit.updateTarget()
		}
		const beganInteracting = didMeleeMove || (didBacklineJump && unit.data.stats.range === 1) || unit.jumpsToBackline()
		if (!beganInteracting) {
			continue
		}

		if (didBacklineJump && unit.canAttack(elapsedMS)) {
			if (unit.readyToCast()) {
				unit.castAbility(elapsedMS, true)
			} else if (unit.target) {
				unit.updateAttack(elapsedMS)
			}
		}
		if (didBacklineJump || unit.jumpsToBackline()) {
			updatePathsIfNeeded(state.units)
			if (unit.updateMove(elapsedMS, diffMS)) {
				continue
			}
		}
	}

	([state.hexEffects, state.projectileEffects, state.shapeEffects] as Set<GameEffect>[]).forEach(effects => {
		effects.forEach(effect => {
			if (effect.update(elapsedMS, diffMS, state.units) === false) {
				effects.delete(effect)
			}
		})
	})

	updatePathsIfNeeded(state.units)

	previousFrameMS = frameMS
	requestNextFrame(frameMS, unanimated)
}

export function cancelLoop() {
	startedAtMS = 0
	previousFrameMS = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
