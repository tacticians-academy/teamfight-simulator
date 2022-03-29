import { ChampionKey, TraitKey, BonusKey, DamageType } from '@tacticians-academy/academy-library'

import { getters } from '#/game/store'

import { getUnitsOfTeam, getVariables } from '#/helpers/abilityUtils'
import { getFrontBehindHexes } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import type { BonusVariable, TraitEffects } from '#/helpers/types'

import { baseTraitEffects } from '../traits'

export const traitEffects = {

	...baseTraitEffects,

	[TraitKey.Hextech]: {
		solo: (unit, activeEffect) => {
			const [shieldAmount, durationSeconds, damage, frequency] = getVariables(activeEffect, 'ShieldAmount', 'ShieldDuration', 'MagicDamage', 'Frequency')
			const repeatsEveryMS = frequency * 1000
			unit.queueShield(0, unit, {
				amount: shieldAmount,
				activatesAfterMS: repeatsEveryMS,
				repeatsEveryMS,
				expiresAfterMS: durationSeconds * 1000,
				bonusDamage: createDamageCalculation(TraitKey.Hextech, damage, DamageType.magic),
			})
		},
	},

	[TraitKey.Mastermind]: {
		applyForOthers: (activeEffect, unit) => {
			const [manaGrant] = getVariables(activeEffect, 'ManaGrant')
			const hexesInFront = getFrontBehindHexes(unit, true)
			getUnitsOfTeam(unit.team)
				.filter(unit => unit.isIn(hexesInFront))
				.forEach(unit => unit.setBonusesFor(TraitKey.Mastermind, [BonusKey.Mana, manaGrant]))
			window.setTimeout(() => { //TODO remove
				unit.queueHexEffect(0, undefined, {
					targetTeam: unit.team,
					hexes: hexesInFront,
				})
			})
		},
	},

	[TraitKey.Rivals]: {
		solo: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			if (unit.name === ChampionKey.Vi) {
				const [manaReduction] = getVariables(activeEffect, 'ViManaReduction')
				variables.push([BonusKey.ManaReduction, manaReduction])
			} else if (unit.name !== ChampionKey.Jinx) {
				console.log('ERR', TraitKey.Rivals, unit.name)
			}
			return variables
		},
		enemyDeath: (activeEffect, elapsedMS, dead, [unit]) => {
			if (unit.name === ChampionKey.Jinx) {
				if (unit.target !== dead) { //TODO use damage credit instead
					return
				}
				const [empoweredSeconds, empoweredAS] = getVariables(activeEffect, 'JinxASDuration', 'JinxEmpoweredAS')
				unit.setBonusesFor(TraitKey.Rivals, [BonusKey.AttackSpeed, empoweredAS * 100, elapsedMS + empoweredSeconds * 1000])
			} else if (unit.name !== ChampionKey.Vi) {
				console.log('ERR', TraitKey.Rivals, unit.name)
			}
		},
	},

	[TraitKey.YordleLord]: {
		solo: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			const yordleEffectVariables = getters.synergiesByTeam.value[unit.team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Yordle)?.activeEffect?.variables
			if (yordleEffectVariables) {
				for (const key in yordleEffectVariables) {
					const yordleValue = yordleEffectVariables[key]
					if (yordleValue != null) {
						variables.push([key, yordleValue])
					}
				}
			}
			return variables
		},
	},

} as TraitEffects
