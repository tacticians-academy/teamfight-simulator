import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { state } from '#/game/store'

import type { BonusScaling, BonusVariable, DamageSourceType, EffectResults, ShieldData } from '#/helpers/types'
import { getClosesUnitOfTeamTo, getInverseHex } from '#/helpers/boardUtils'

interface ItemFns {
	adjacentHexBuff?: (item: ItemData, unit: ChampionUnit, adjacentUnits: ChampionUnit[]) => EffectResults,
	apply?: (item: ItemData, unit: ChampionUnit) => EffectResults,
	innate?: (item: ItemData, unit: ChampionUnit) => EffectResults,
	update?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => EffectResults,
	damageDealtByHolder?: (originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
	basicAttack?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, target: ChampionUnit, source: ChampionUnit, canReProc: boolean) => void
	damageTaken?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
}

export default {

	[ItemKey.ArchangelsStaff]: {
		innate: (item, unit) => {
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

	[ItemKey.BansheesClaw]: {
		adjacentHexBuff: (item, unit, adjacentUnits) => {
			const damageCap = item.effects['DamageCap']
			if (damageCap == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.push(unit)
			adjacentUnits.forEach(unit => unit.shields.push({
				isSpellShield: true,
				amount: damageCap,
			}))
		},
	},

	[ItemKey.Bloodthirster]: {
		damageTaken: (elapsedMS, item, itemID, originalSource, target, source, sourceType, rawDamage, takingDamage, damageType) => {
			const healthThreshold = item.effects['HPThreshold']
			const shieldHPPercent = item.effects['ShieldHPPercent']
			const shieldDurationSeconds = item.effects['ShieldDuration']
			if (healthThreshold == null || shieldHPPercent == null || shieldDurationSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			if (!target.shields.some(shield => shield.id === itemID) && target.healthProportion() <= healthThreshold / 100) {
				target.shields.push({
					id: itemID,
					amount: shieldHPPercent / 100 * target.healthMax,
					expiresAtMS: elapsedMS + shieldDurationSeconds * 1000,
				})
			}
		},
	},

	[ItemKey.ChaliceOfPower]: {
		adjacentHexBuff: (item, unit, adjacentUnits) => {
			const bonusAP = item.effects['BonusAP']
			if (bonusAP == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, [BonusKey.AbilityPower, bonusAP]))
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

	[ItemKey.LocketOfTheIronSolari]: {
		adjacentHexBuff: (item, unit, adjacentUnits) => {
			const shieldValue = item.effects[`${unit.starLevel}StarShieldValue`]
			const shieldDuration = item.effects['ShieldDuration']
			if (shieldValue == null || shieldDuration == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.push(unit)
			adjacentUnits.forEach(unit => unit.shields.push({
				amount: shieldValue,
				expiresAtMS: shieldDuration * 1000,
			}))
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
		apply: (item, unit) => {
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

	[ItemKey.ZekesHerald]: {
		adjacentHexBuff: (item, unit, adjacentUnits) => {
			const bonusAS = item.effects['AS']
			if (bonusAS == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, [BonusKey.AttackSpeed, bonusAS]))
		},
	},

	[ItemKey.Zephyr]: {
		apply: (item, unit) => {
			const banishDuration = item.effects['BanishDuration']
			if (banishDuration == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const targetHex = getInverseHex(unit.startPosition)
			const target = getClosesUnitOfTeamTo(targetHex, unit.opposingTeam(), state.units) //TODO not random
			if (target) {
				target.banishUntil(banishDuration * 1000)
			}
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
