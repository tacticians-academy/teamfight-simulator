import { BonusKey, COMPONENT_ITEM_IDS, DamageType } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { gameOver, getters, state } from '#/game/store'

import { getUnitsOfTeam } from '#/helpers/abilityUtils'
import { createDamageCalculation } from '#/helpers/bonuses'
import { DamageSourceType, MutantType } from '#/helpers/types'
import type { BonusVariable, BonusScaling, EffectResults, ShieldData } from '#/helpers/types'

type TraitEffectFn = (unit: ChampionUnit, activeEffect: TraitEffectData) => EffectResults
interface TraitFns {
	solo?: TraitEffectFn,
	team?: TraitEffectFn,
	innate?: TraitEffectFn,
	damageDealtByHolder?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => number
}

export default {

	[TraitKey.Bodyguard]: {
		solo: (unit, activeEffect) => {
			const shieldAmount = activeEffect.variables['ShieldAmount']
			if (shieldAmount == null) {
				return console.log('ERR', 'Missing', 'shieldAmount', activeEffect)
			}
			const shield: ShieldData = {
				activatesAtMS: 1000, //TODO experimentally determine
				amount: shieldAmount,
			}
			//TODO Taunt
			return { shields: [shield] }
		},
	},

	[TraitKey.Clockwork]: {
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			const bonusPerAugment = activeEffect.variables['BonusPerAugment']
			const bonusAS = activeEffect.variables['ASBonus']
			if (bonusPerAugment != null) {
				variables.push([BonusKey.AttackSpeed, getters.augmentCount.value * bonusPerAugment * 100])
			} else {
				console.log('Invalid effect', 'Clockwork', activeEffect.variables)
			}
			if (bonusAS != null) {
				variables.push([BonusKey.AttackSpeed, bonusAS * 100])
			} else {
				console.log('Invalid effect', 'Clockwork', activeEffect.variables)
			}
			return { variables }
		},
	},

	[TraitKey.Colossus]: {
		innate: (unit, innateEffect) => {
			const variables: BonusVariable[] = []
			const bonusHealth = innateEffect.variables[`Bonus${BonusKey.Health}Tooltip`]
			if (bonusHealth != null) {
				variables.push([BonusKey.Health, bonusHealth])
			} else {
				console.log('Missing Colossus HP bonus', innateEffect.variables)
			}
			return { variables }
		},
	},

	[TraitKey.Mutant]: {
		damageDealtByHolder: (activeEffect, elapsedMS, target, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (state.mutantType === MutantType.Voidborne) {
				const executeThreshold = activeEffect.variables['MutantVoidborneExecuteThreshold']
				if (executeThreshold == null) {
					return console.log('ERR', 'No executeThreshold', state.mutantType, activeEffect)
				}
				if (target.healthProportion() <= executeThreshold / 100) {
					target.die(state.units, gameOver)
				} else if (sourceType === DamageSourceType.attack || sourceType === DamageSourceType.spell) {
					const trueDamageBonus = activeEffect.variables['MutantVoidborneTrueDamagePercent']
					if (trueDamageBonus != null) {
						const damageCalculation = createDamageCalculation('MutantVoidborneTrueDamagePercent', rawDamage * trueDamageBonus / 100, DamageType.true)
						target.damage(elapsedMS, source, DamageSourceType.trait, damageCalculation, undefined, false, state.units, gameOver)
					}
				}
			}
		},
		solo: (unit, activeEffect) => {
			const scalings: BonusScaling[] = []
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.Metamorphosis) {
				const intervalSeconds = activeEffect.variables['MutantMetamorphosisGrowthRate']
				const amountARMR = activeEffect.variables['MutantMetamorphosisArmorMR']
				const amountADAP = activeEffect.variables['MutantMetamorphosisADAP']
				if (intervalSeconds != null && amountADAP != null && amountARMR != null) {
					scalings.push(
						{
							source: MutantType.Metamorphosis,
							activatedAt: 0,
							stats: [BonusKey.AttackDamage, BonusKey.AbilityPower],
							intervalAmount: amountADAP,
							intervalSeconds,
						},
						{
							source: MutantType.Metamorphosis,
							activatedAt: 0,
							stats: [BonusKey.Armor, BonusKey.MagicResist],
							intervalAmount: amountARMR,
							intervalSeconds,
						},
					)
				} else {
					console.log('ERR Invalid Metamorphosis', activeEffect.variables)
				}
			} else if (state.mutantType === MutantType.Cybernetic) {
				if (unit.items.length) {
					const cyberHP = activeEffect.variables['MutantCyberHP']
					const cyberAD = activeEffect.variables['MutantCyberAD']
					if (cyberHP != null && cyberAD != null) {
						variables.push([BonusKey.Health, cyberHP])
						variables.push([BonusKey.AttackDamage, cyberAD])
					}
				}
			}
			return { scalings, variables }
		},
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.BioLeeching) {
				const omnivamp = activeEffect.variables['MutantBioLeechingOmnivamp']
				if (omnivamp != null) {
					variables.push([BonusKey.VampOmni, omnivamp])
				} else {
					console.log('Invalid effect', 'Mutant', state.mutantType, activeEffect.variables)
				}
			}
			return { variables }
		},
	},

	[TraitKey.Scholar]: {
		team: (unit, activeEffect) => {
			const scalings: BonusScaling[] = []
			const intervalAmount = activeEffect.variables['ManaPerTick']
			const intervalSeconds = activeEffect.variables['TickRate']
			if (intervalAmount != null && intervalSeconds != null) {
				scalings.push({
					source: TraitKey.Scholar,
					activatedAt: 0,
					stats: [BonusKey.Mana],
					intervalAmount,
					intervalSeconds,
				})
			} else {
				console.log('Invalid effect', 'Scholar', activeEffect.variables)
			}
			return { scalings }
		},
	},

	[TraitKey.Scrap]: {
		team: (unit, activeEffect) => {
			const shields: ShieldData[] = []
			const amountPerComponent = activeEffect.variables['HPShieldAmount']
			if (amountPerComponent != null) {
				const amount = getUnitsOfTeam(unit.team)
					.reduce((unitAcc, unit) => {
						return unitAcc + unit.items.reduce((itemAcc, item) => itemAcc + amountPerComponent * (COMPONENT_ITEM_IDS.includes(item.id) ? 1 : 2), 0)
					}, 0)
				shields.push({
					amount,
				})
			}
			return { shields }
		},
	},

	[TraitKey.Sniper]: {
		damageDealtByHolder: (activeEffect, elapsedMS, target, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (sourceType === DamageSourceType.attack || sourceType === DamageSourceType.spell) {
				const key = 'PercentDamageIncrease'
				const percentBonusDamagePerHex = activeEffect.variables[key]
				if (percentBonusDamagePerHex == null) {
					return console.log('ERR', 'Missing', key, activeEffect)
				}
				const hexDistance = source.hexDistanceTo(target)
				const damageCalculation = createDamageCalculation(key, takingDamage * percentBonusDamagePerHex / 100 * hexDistance, damageType)
				target.damage(elapsedMS, source, DamageSourceType.trait, damageCalculation, undefined, false, state.units, gameOver)
			}
		},
		innate: (unit, innateEffect) => {
			const variables: BonusVariable[] = []
			const rangeIncrease = innateEffect.variables[BonusKey.HexRangeIncrease]
			if (rangeIncrease != null) {
				variables.push([BonusKey.HexRangeIncrease, rangeIncrease])
			} else {
				console.log('Missing Sniper range increase', innateEffect.variables)
			}
			return { variables }
		},
	},

} as { [key in TraitKey]?: TraitFns }
