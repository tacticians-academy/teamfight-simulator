import { BonusKey, COMPONENT_ITEM_IDS } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { getters, state } from '#/game/store'

import { getUnitsOfTeam } from '#/helpers/abilityUtils'
import { MutantType } from '#/helpers/types'
import type { BonusVariable, BonusScaling, EffectResults, ShieldData, TeamNumber } from '#/helpers/types'

type TraitEffectFn = (activeEffect: TraitEffectData, teamNumber: TeamNumber) => EffectResults
interface TraitFns {
	solo?: TraitEffectFn,
	team?: TraitEffectFn,
	innate?: TraitEffectFn,
}

export default {

	[TraitKey.Clockwork]: {
		team: (activeEffect: TraitEffectData) => {
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
		innate: (innateEffect: TraitEffectData) => {
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
		solo: (activeEffect: TraitEffectData) => {
			const scalings: BonusScaling[] = []
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
			}
			return { scalings }
		},
		team: (activeEffect: TraitEffectData) => {
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
		team: (activeEffect: TraitEffectData) => {
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
		team: (activeEffect: TraitEffectData, teamNumber: TeamNumber) => {
			const shields: ShieldData[] = []
			const amountPerComponent = activeEffect.variables['HPShieldAmount']
			if (amountPerComponent != null) {
				const amount = getUnitsOfTeam(teamNumber)
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
		innate: (innateEffect: TraitEffectData) => {
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
