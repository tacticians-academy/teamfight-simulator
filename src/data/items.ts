import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { BonusScaling, BonusVariable, DamageSourceType, EffectResults, ShieldData } from '#/helpers/types'

interface ItemFns {
	apply?: (item: ItemData) => EffectResults,
	innate?: (item: ItemData) => EffectResults,
	update?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, unit: ChampionUnit) => EffectResults,
	damageDealtByHolder?: (originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
	basicAttack?: (item: ItemData, target: ChampionUnit, source: ChampionUnit, canReProc: boolean) => void
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

	[ItemKey.FrozenHeart]: {
		update: (elapsedMS, item, unit) => {
			const slowAS = item.effects['ASSlow']
			const hexRadius = item.effects['HexRadius']
			const durationSeconds = 0.5 //NOTE hardcoded apparently??
			if (hexRadius == null || slowAS == null) {
				return console.log('ERR', ItemKey.FrozenHeart, item.effects)
			}
			const affectedUnits = unit.getUnitsWithin(hexRadius, unit.opposingTeam())
			affectedUnits.forEach(unit => unit.applyAttackSpeedSlow(elapsedMS, durationSeconds * 1000, slowAS))
		},
	},

	[ItemKey.HextechGunblade]: {
		damageDealtByHolder: (originalSource, target, source, sourceType, rawDamage, takingDamage, damageType) => {
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
						lowestUnit.gainHealth(takingDamage * hextechHeal / 100)
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
