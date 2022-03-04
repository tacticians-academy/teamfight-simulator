import { BonusKey } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { getters, state } from '#/game/store'

import { MutantType } from '#/helpers/types'
import type { BonusVariable, BonusScaling, TraitEffectFn } from '#/helpers/types'

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
			return [variables, []]
		},
	},

	Mutant: {
		team: (activeEffect: TraitEffectData) => {
			if (state.mutantType === MutantType.BioLeeching) {
				const variables: BonusVariable[] = []
				const omnivamp = activeEffect.variables['MutantBioLeechingOmnivamp']
				if (omnivamp != null) {
					variables.push([BonusKey.VampOmni, omnivamp])
				} else {
					console.log('Invalid effect', 'Mutant', state.mutantType, activeEffect.variables)
				}
				return [variables, []]
			}
			return [[], []]
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
			return [[], scalings]
		},
	},

} as { [key in TraitKey]?: {team?: TraitEffectFn} }
