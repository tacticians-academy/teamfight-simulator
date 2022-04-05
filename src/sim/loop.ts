import { BonusKey } from '@tacticians-academy/academy-library'

import { getters, setData, state } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import type { GameEffect } from '#/sim/effects/GameEffect'

import { MOVE_LOCKOUT_JUMPERS_MS, MOVE_LOCKOUT_MELEE_MS } from '#/sim/helpers/constants'
import { getAliveUnitsOfTeamWithTrait } from '#/sim/helpers/effectUtils'
import type { TeamNumber } from '#/sim/helpers/types'
import { uniqueIdentifier } from '#/sim/helpers/utils'

const GAME_TICK_MS = 1000 / 30 // Confirmed

let frameID: number | null = null
let startedAtMS: DOMHighResTimeStamp = 0
let elapsedMS: DOMHighResTimeStamp = 0

let didBacklineJump = false
let didMeleeMove = false

const delays = new Set<[activatesAtMS: DOMHighResTimeStamp, callback: (elapsedMS: DOMHighResTimeStamp) => void]>()

export async function delayUntil(elapsedMS: DOMHighResTimeStamp, atSeconds: number) {
	return await new Promise<DOMHighResTimeStamp>((resolve, reject) => {
		delays.add([elapsedMS + atSeconds * 1000, resolve])
	})
}

export function runLoop(animated: boolean) {
	const frameMS = performance.now()
	initGame(frameMS)
	if (animated === true) {
		frameRequestCallback(frameMS)
	} else {
		while (state.winningTeam == null) {
			playNextFrame()
		}
	}
}

export function cancelLoop() {
	startedAtMS = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}

function frameRequestCallback(frameMS: DOMHighResTimeStamp) {
	const sinceUpdateMS = frameMS - (startedAtMS + elapsedMS)
	if (sinceUpdateMS > GAME_TICK_MS * 0.75) {
		playNextFrame()
	}
	if (state.winningTeam != null) {
		cancelLoop()
	} else {
		frameID = window.requestAnimationFrame(frameRequestCallback)
	}
}

export function initGame(frameMS: DOMHighResTimeStamp) {
	delays.clear()
	startedAtMS = frameMS
	elapsedMS = 0
	didBacklineJump = false
	didMeleeMove = false
	const backlineJumpers = state.units.filter(unit => unit.jumpsToBackline())
	backlineJumpers.forEach(unit => unit.activeHex = [-1, -1])
	backlineJumpers.forEach(unit => unit.jumpToBackline())
	state.units.forEach(unit => {
		unit.shields.forEach(shield => {
			shield.activated = shield.activatesAtMS == null
			const healShieldBoost = shield.source?.getBonuses(BonusKey.HealShieldBoost)
			if (shield.amount != null && healShieldBoost != null) {
				shield.amount *= (1 + healShieldBoost)
			}
			if (shield.repeatsEveryMS != null) {
				shield.repeatAmount = shield.amount
			}
		})
	})
	const unitsByTeam: [ChampionUnit[], ChampionUnit[]] = [[], []]
	state.units.forEach(unit => unitsByTeam[unit.team].push(unit))
	unitsByTeam.forEach((units, team) => {
		getters.activeAugmentEffectsByTeam.value[team].forEach(([augment, effects]) => effects.startOfFight?.(augment, team as TeamNumber, units))
	})
}

function playNextFrame() {
	elapsedMS += GAME_TICK_MS
	state.elapsedSeconds = Math.round(elapsedMS / 1000)

	delays.forEach(delay => {
		const [atMS, resolve] = delay
		if (elapsedMS >= atMS) {
			resolve(elapsedMS)
			delays.delete(delay)
		}
	})

	getters.synergiesByTeam.value.forEach((teamSynergies, teamNumber) => {
		teamSynergies.forEach(({ key, activeEffect }) => {
			if (activeEffect) {
				const updateFn = setData.traitEffects[key]?.update
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
			setData.itemEffects[item.name]?.update?.(elapsedMS, item, uniqueIdentifier(index, item), unit)
		})
		for (const pendingBonus of unit.pendingBonuses) {
			const [startsAtMS, pendingKey, bonuses] = pendingBonus
			if (elapsedMS >= startsAtMS) {
				unit.addBonuses(pendingKey, ...bonuses.filter(([key, value]) => {
					if (key === BonusKey.MissingHealth) {
						if (value != null) {
							unit.gainHealth(elapsedMS, unit, unit.missingHealth() * value, true)
						}
						return false
					}
					return true
				}))
				unit.pendingBonuses.delete(pendingBonus)
			}
		}
	}

	for (const unit of state.units) {
		if (!unit.isInteractable()) {
			continue
		}
		unit.updateTarget()
		const unitBeganInteracting = didMeleeMove || unit.jumpsToBackline()
		if (!unitBeganInteracting) {
			continue
		}

		if (didBacklineJump && unit.canPerformAction(elapsedMS)) {
			if (unit.championEffects?.cast != null && unit.readyToCast(elapsedMS)) {
				unit.castAbility(elapsedMS, true)
			} else if (unit.canAttackTarget() && !unit.statusEffects.disarm.active) {
				unit.updateAttack(elapsedMS)
			}
		}
		if (didBacklineJump || unit.jumpsToBackline()) {
			if (unit.updateMove(elapsedMS, GAME_TICK_MS)) {
				continue
			}
		}
	}

	([state.hexEffects, state.moveUnitEffects, state.projectileEffects, state.shapeEffects, state.targetEffects] as Set<GameEffect>[]).forEach(effects => {
		effects.forEach(effect => {
			if (effect.update(elapsedMS, GAME_TICK_MS, state.units) === false) {
				effects.delete(effect)
			}
		})
	})
}
