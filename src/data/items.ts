import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { ChampionUnit } from '#/game/ChampionUnit'

import { DamageType } from '#/helpers/types'
import type { BonusScaling, EffectResults, ShieldData } from '#/helpers/types'

type ItemEffectFn = (item: ItemData) => EffectResults
interface ItemFns {
	innate?: ItemEffectFn,
	damageDealtByHolder: (target: ChampionUnit, source: ChampionUnit, damage: number, damageType: DamageType) => void
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

	[ItemKey.HextechGunblade]: {
		damageDealtByHolder: (target, source, damage, damageType) => {
			if (damageType !== DamageType.physical) {
				const hextechHeal = source.getBonusesFromKey(ItemKey.HextechGunblade, BonusKey.VampSpell)
				if (hextechHeal > 0) {
					let lowestHP = Number.MAX_SAFE_INTEGER
					let lowestUnit: ChampionUnit | undefined
					source.alliedUnits().forEach(unit => {
						if (unit.health < lowestHP) {
							lowestHP = unit.health
							lowestUnit = unit
						}
					})
					if (lowestUnit) {
						lowestUnit.gainHealth(damage * hextechHeal / 100)
					}
				}
			}
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
