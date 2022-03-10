import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { BonusScaling, BonusVariable, DamageSourceType, EffectResults, ShieldData } from '#/helpers/types'

interface ItemFns {
	apply?: (item: ItemData) => EffectResults,
	innate?: (item: ItemData) => EffectResults,
	update?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => EffectResults,
	damageDealtByHolder?: (originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
	basicAttack?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, target: ChampionUnit, source: ChampionUnit, canReProc: boolean) => void
	damageTaken?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
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
		update: (elapsedMS, item, itemID, unit) => {
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

	[ItemKey.TitansResolve]: {
		basicAttack: (elapsedMS, item, itemID, target, source, canReProc) => {
			applyTitansResolve(item, itemID, source)
		},
		damageTaken: (elapsedMS, item, itemID, originalSource, target, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (originalSource) {
				applyTitansResolve(item, itemID, target)
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

function applyTitansResolve(item: ItemData, itemID: any, unit: ChampionUnit) {
	const stackAD = item.effects['StackingAD']
	const stackAP = item.effects['StackingAP']
	const maxStacks = item.effects['StackCap']
	const resistsAtCap = item.effects['BonusResistsAtStackCap']
	if (stackAD == null || stackAP == null || maxStacks == null || resistsAtCap == null) {
		return console.log('ERR', item.name, item.effects)
	}
	const bonuses = unit.getBonusesFrom(itemID)
	if (bonuses.length < maxStacks) {
		const variables: BonusVariable[] = []
		variables.push([BonusKey.AttackDamage, stackAD], [BonusKey.AbilityPower, stackAP])
		if (bonuses.length === maxStacks - 1) {
			variables.push([BonusKey.Armor, resistsAtCap], [BonusKey.MagicResist, resistsAtCap])
		}
		unit.addBonuses(itemID, ...variables)
	}
}
