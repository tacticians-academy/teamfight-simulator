import { BonusKey, ItemKey } from '@tacticians-academy/academy-library'

import { getVariables } from '#/helpers/abilityUtils'
import { StatusEffectType } from '#/helpers/types'
import type { ItemEffects } from '#/helpers/types'

import { baseItemEffects } from '../items'

export const itemEffects = {

	...baseItemEffects,

	[ItemKey.EdgeOfNight]: {
		disableDefaultVariables: [BonusKey.AttackSpeed, BonusKey.DamageReduction],
		hpThreshold: (elapsedMS, item, itemID, unit) => {
			const [attackSpeed, stealthSeconds] = getVariables(item, BonusKey.AttackSpeed, 'StealthDuration')
			const stealthMS = stealthSeconds * 1000
			unit.clearNegativeEffects()
			unit.applyStatusEffect(elapsedMS, StatusEffectType.stealth, stealthMS)
			unit.queueBonus(elapsedMS, stealthMS, ItemKey.EdgeOfNight, [BonusKey.AttackSpeed, attackSpeed])
		},
	},

} as ItemEffects
