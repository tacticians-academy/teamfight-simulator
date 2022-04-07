import { ChampionKey, TraitKey, BonusKey, DamageType } from '@tacticians-academy/academy-library'

import { getters } from '#/store/store'

import type { TraitEffects } from '#/sim/data/types'

import { getFrontBehindHexes } from '#/sim/helpers/board'
import { createDamageCalculation } from '#/sim/helpers/calculate'
import { getAliveUnitsOfTeamWithTrait, getUnitsOfTeam, getVariables } from '#/sim/helpers/effectUtils'
import type { BonusVariable } from '#/sim/helpers/types'

import { baseTraitEffects } from '../traits'

export const traitEffects = {

	...baseTraitEffects,

	[TraitKey.Debonair]: {
		innate: (unit, innateEffect) => {
			const key = TraitKey.Debonair
			if (!unit.hasInnateTrait(key)) return // Only innate Debonairs can be VIP
			unit.initStack(key, {
				icon: '💎',
				isBoolean: true,
				onAfterUpdate: (unit) => {
					getAliveUnitsOfTeamWithTrait(unit.team, key).forEach(ally => {
						if (ally !== unit) {
							const stack = ally.stacks[key]
							if (stack) {
								stack.amount = 0
							}
						}
					})
				},
			})
		},
	},

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
			const sampleEffect = unit.queueHexEffect(0, undefined, {
				targetTeam: unit.team,
				hexes: hexesInFront,
			})
			sampleEffect.started.value = true
		},
	},

	[TraitKey.Rivals]: {
		solo: (unit, activeEffect) => {
			if (unit.name === ChampionKey.Vi) {
				const [manaReduction] = getVariables(activeEffect, 'ViManaReduction')
				return [
					[BonusKey.ManaReduction, manaReduction],
				]
			}
			if (unit.name !== ChampionKey.Jinx) {
				console.log('ERR', TraitKey.Rivals, unit.name)
			}
		},
		enemyDeath: (activeEffect, elapsedMS, deadEnemy, [unit]) => {
			if (unit == null) { return }
			if (unit.name === ChampionKey.Jinx) {
				if (!unit.hasAssistCreditFor(deadEnemy)) {
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
			const yordleEffectVariables = getters.synergiesByTeam.value[unit.team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Yordle)?.activeEffect?.variables
			if (yordleEffectVariables) {
				const variables: BonusVariable[] = []
				for (const key in yordleEffectVariables) {
					const yordleValue = yordleEffectVariables[key]
					if (yordleValue != null) {
						variables.push([key, yordleValue])
					}
				}
				return variables
			}
		},
	},

} as TraitEffects
