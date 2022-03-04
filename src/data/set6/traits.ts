import { BonusKey } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { getters, state } from '#/game/store'

import { MutantType } from '#/helpers/types'
import type { BonusVariable, BonusRegen, TraitEffectFn } from '#/helpers/types'

export default {

	Clockwork: {
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

	Scholar: {
		team: (activeEffect: TraitEffectData) => {
			const regens: BonusRegen[] = []
			const manaPerTick = activeEffect.variables['ManaPerTick']
			const tickRate = activeEffect.variables['TickRate']
			if (tickRate != null && manaPerTick != null) {
				regens.push({
					activatedAt: 0,
					stat: BonusKey.Mana,
					perTick: manaPerTick,
					tickRate,
				})
			} else {
				console.log('Invalid effect', 'Scholar', activeEffect.variables)
			}
			return [[], regens]
		},
	},

} as { [key in TraitKey]?: {team?: TraitEffectFn} }
