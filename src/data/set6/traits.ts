import { BonusKey } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { state } from '#/game/store'

import type { BonusVariable, BonusRegen, TraitEffectFn } from '#/helpers/types'

export default {
	Clockwork: {
		team: (activeEffect: TraitEffectData) => {
			const variables: BonusVariable[] = []
			const bonusPerAugment = activeEffect.variables['BonusPerAugment']
			const bonusAS = activeEffect.variables['ASBonus']
			if (bonusPerAugment != null) {
				variables.push([BonusKey.AttackSpeed, state.augmentCount * bonusPerAugment * 100])
			}
			if (bonusAS != null) {
				variables.push([BonusKey.AttackSpeed, bonusAS * 100])
			}
			return [variables, []]
		},
	},
} as { [key in TraitKey]?: { team?: TraitEffectFn } }
