import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { BonusScaling, EffectResults, ShieldData } from '#/helpers/types'

type ItemEffectFn = (item: ItemData) => EffectResults
interface ItemFns {
	innate?: ItemEffectFn,
}

export default {

	[ItemKey.ArchangelsStaff]: {
		innate: (item) => {
			const scalings: BonusScaling[] = []
			const intervalAmount = item.effects['APPerInterval']
			const intervalSeconds = item.effects['IntervalSeconds']
			if (intervalAmount != null && intervalSeconds != null) {
				scalings.push({
					activatedAt: 0,
					source: item.name,
					stats: [BonusKey.AbilityPower],
					intervalAmount,
					intervalSeconds,
				})
			} else {
				console.log('Missing effects', item)
			}
			return { scalings }
		},
	},

	[ItemKey.Quicksilver]: {
		innate: (item) => {
			const shields: ShieldData[] = []
			const shieldDuration = item.effects['SpellShieldDuration']
			if (shieldDuration != null) {
				shields.push({
					isSpellShield: true,
					amount: 0, //TODO does not break
					expiresAtMS: shieldDuration * 1000,
				})
			}
			return { shields }
		},
	},

} as { [key in ItemKey]?: ItemFns }
