import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { BonusScaling, EffectResults } from '#/helpers/types'

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

} as { [key in ItemKey]?: ItemFns }
