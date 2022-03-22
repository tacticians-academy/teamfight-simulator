import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import { ChampionUnit } from '#/game/ChampionUnit'
import { needsPathfindingUpdate } from '#/game/pathfind'
import { activatedCheck, state } from '#/game/store'
import { ShapeEffectRectangle } from '#/game/ShapeEffect'

import { getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { getClosestHexAvailableTo, getClosestUnitOfTeamWithinRangeTo, getInverseHex, getNearestAttackableEnemies } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { HEX_PROPORTION } from '#/helpers/constants'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { BonusScaling, BonusVariable, EffectResults, HexCoord, ShieldData } from '#/helpers/types'

const BURN_ID = 'BURN'

interface ItemFns {
	adjacentHexBuff?: (item: ItemData, unit: ChampionUnit, adjacentUnits: ChampionUnit[]) => void
	apply?: (item: ItemData, unit: ChampionUnit) => void
	disableDefaultVariables?: true | BonusKey[]
	innate?: (item: ItemData, unit: ChampionUnit) => EffectResults
	update?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
	damageDealtByHolder?: (item: ItemData, itemID: string, elapsedMS: DOMHighResTimeStamp, isOriginalSource: boolean, target: ChampionUnit, holder: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
	modifyDamageByHolder?: (item: ItemData, isOriginalSource: boolean, target: ChampionUnit, holder: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, damageType: DamageType) => number
	basicAttack?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, target: ChampionUnit, holder: ChampionUnit, canReProc: boolean) => void
	damageTaken?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, isOriginalSource: boolean, holder: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => void
	castWithinHexRange?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, caster: ChampionUnit, holder: ChampionUnit) => void
	hpThreshold?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
	deathOfHolder?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
}

function checkCooldown(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, item: ItemData, itemID: string, instantlyApplies: boolean, cooldownKey: string = 'ICD') {
	const checkKey = unit.instanceID + itemID
	const activatedAtMS = activatedCheck[checkKey]
	const itemCooldownSeconds = item.effects[cooldownKey]
	if (itemCooldownSeconds == null) {
		console.log('ERR icd', item.name, item.effects)
		return true
	}
	if (activatedAtMS != null && elapsedMS < activatedAtMS + itemCooldownSeconds * 1000) {
		return false
	}
	activatedCheck[checkKey] = elapsedMS
	return instantlyApplies ? true : activatedAtMS != null
}

export default {

	[ItemKey.ArchangelsStaff]: {
		innate: (item, unit) => {
			const scalings: BonusScaling[] = []
			const intervalAmount = item.effects['APPerInterval']
			const intervalSeconds = item.effects['IntervalSeconds']
			if (intervalAmount != null && intervalSeconds != null) {
				scalings.push({
					source: unit,
					sourceID: item.id,
					activatedAtMS: 0,
					stats: [BonusKey.AbilityPower],
					intervalAmount,
					intervalSeconds,
				})
			} else {
				console.log('ERR', item.name, item.effects)
			}
			return { scalings }
		},
	},

	[ItemKey.BansheesClaw]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const damageCap = item.effects['DamageCap']
			if (damageCap == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.push(holder)
			adjacentUnits.forEach(unit => unit.shields.push({
				source: holder,
				isSpellShield: true,
				amount: damageCap,
			}))
		},
	},

	[ItemKey.Bloodthirster]: {
		hpThreshold: (elapsedMS, item, itemID, holder) => {
			const shieldHPPercent = item.effects['ShieldHPPercent']
			const shieldDurationSeconds = item.effects['ShieldDuration']
			if (shieldHPPercent == null || shieldDurationSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			holder.shields.push({
				source: holder,
				amount: shieldHPPercent / 100 * holder.healthMax,
				expiresAtMS: elapsedMS + shieldDurationSeconds * 1000,
			})
		},
	},

	[ItemKey.BrambleVest]: {
		damageTaken: (elapsedMS, item, itemID, isOriginalSource, holder, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (isOriginalSource && sourceType === DamageSourceType.attack && checkCooldown(elapsedMS, holder, item, itemID, true)) {
				const aoeDamage = item.effects[`${holder.starLevel}StarAoEDamage`]
				if (aoeDamage == null) {
					return console.log('ERR', item.name, item.effects)
				}
				holder.getInteractableUnitsWithin(1, holder.opposingTeam()).forEach(unit => {
					const damageCalculation = createDamageCalculation(item.name, aoeDamage, DamageType.magic)
					unit.damage(elapsedMS, false, holder, DamageSourceType.item, damageCalculation, true)
				})
			}
		},
	},

	[ItemKey.ChaliceOfPower]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const bonusAP = item.effects['BonusAP']
			if (bonusAP == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, [BonusKey.AbilityPower, bonusAP]))
		},
	},

	[ItemKey.DragonsClaw]: {
		damageTaken: (elapsedMS, item, itemID, isOriginalSource, holder, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (isOriginalSource && sourceType === DamageSourceType.spell && damageType !== DamageType.physical && checkCooldown(elapsedMS, holder, item, itemID, true)) {
				holder.queueProjectileEffect(elapsedMS, undefined, {
					target: source,
					damageCalculation: createDamageCalculation(item.name, 0.18, DamageType.magic, BonusKey.Health, 1),
					sourceType: DamageSourceType.item,
					missile: {
						speedInitial: 500, //TODO experimentally determine
					},
				})
			}
		},
	},

	[ItemKey.EdgeOfNight]: {
		disableDefaultVariables: [BonusKey.AttackSpeed, BonusKey.DamageReduction],
		hpThreshold: (elapsedMS, item, itemID, unit) => {
			const attackSpeed = item.effects[BonusKey.AttackSpeed]
			const stealthSeconds = item.effects['StealthDuration']
			if (attackSpeed == null || stealthSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const stealthMS = stealthSeconds * 1000
			const negativeEffects = [StatusEffectType.armorReduction, StatusEffectType.attackSpeedSlow, StatusEffectType.grievousWounds]
			negativeEffects.forEach(statusEffect => unit.statusEffects[statusEffect].active = false)
			unit.applyStatusEffect(elapsedMS, StatusEffectType.stealth, stealthMS)
			unit.queueBonus(elapsedMS, stealthMS, ItemKey.EdgeOfNight, [BonusKey.AttackSpeed, attackSpeed])
		},
	},

	[ItemKey.FrozenHeart]: {
		update: (elapsedMS, item, itemID, unit) => {
			const slowAS = item.effects['ASSlow']
			const hexRadius = item.effects['HexRadius']
			const durationSeconds = 0.5 //NOTE hardcoded apparently??
			if (hexRadius == null || slowAS == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const affectedUnits = unit.getInteractableUnitsWithin(hexRadius, unit.opposingTeam())
			affectedUnits.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.attackSpeedSlow, durationSeconds * 1000, slowAS))
		},
	},

	[ItemKey.GargoyleStoneplate]: {
		update: (elapsedMS, item, itemID, unit) => {
			const perEnemyArmor = item.effects['ArmorPerEnemy']
			const perEnemyMR = item.effects['MRPerEnemy']
			if (perEnemyArmor == null || perEnemyMR == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const unitsTargeting = getInteractableUnitsOfTeam(unit.opposingTeam())
				.filter(enemy => enemy.target === unit)
				.length
			unit.setBonusesFor(itemID as any, [BonusKey.Armor, perEnemyArmor * unitsTargeting], [BonusKey.MagicResist, perEnemyMR * unitsTargeting])
		},
	},

	[ItemKey.GiantSlayer]: {
		modifyDamageByHolder: (item, isOriginalSource, target, holder, sourceType, rawDamage, damageType) => {
			if (!isOriginalSource || (sourceType !== DamageSourceType.attack && sourceType !== DamageSourceType.spell)) {
				return rawDamage
			}
			const thresholdHP = item.effects['HPThreshold']
			const largeBonusPct = item.effects['LargeBonusPct']
			const smallBonusPct = item.effects['SmallBonusPct']
			if (thresholdHP == null || smallBonusPct == null || largeBonusPct == null) {
				console.log('ERR', item.name, item.effects)
				return rawDamage
			}
			const bonusPercent = target.healthMax >= thresholdHP ? largeBonusPct : smallBonusPct
			return rawDamage * (1 + bonusPercent / 100)
		},
	},

	[ItemKey.GuinsoosRageblade]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			const perStackAS = item.effects['ASPerStack']
			if (perStackAS === undefined) {
				return console.log('ERR', item.name, item.effects)
			}
			holder.addBonuses(itemID as any, [BonusKey.AttackSpeed, perStackAS])
		},
	},

	[ItemKey.HandOfJustice]: {
		damageDealtByHolder: (item, itemID, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (sourceType === DamageSourceType.attack || sourceType === DamageSourceType.spell) {
				const baseHeal = item.effects['BaseHeal']
				const increaseEffect = item.effects['AdditionalHeal']
				if (baseHeal == null || increaseEffect == null) {
					return console.log('ERR', item.name, item.effects)
				}
				holder.gainHealth(elapsedMS, holder, takingDamage * (baseHeal + increaseEffect / 2) / 100, true) //TODO averaged increaseEffect
			}
		},
		innate: (item, unit) => {
			const variables: BonusVariable[] = []
			const increaseEffect = item.effects['AdditionalADAP']
			if (increaseEffect != null) {
				const increase = increaseEffect / 2 //TODO averaged increaseEffect
				variables.push([BonusKey.AbilityPower, increase], [BonusKey.AttackDamage, increase])
			} else {
				console.log('ERR', item.name, item.effects)
			}
			return { variables }
		},
	},

	[ItemKey.HextechGunblade]: {
		damageDealtByHolder: (item, itemID, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (damageType !== DamageType.physical) {
				const hextechHeal = item.effects[BonusKey.VampSpell]
				if (hextechHeal == null) {
					return console.log('ERR', item.name, item.effects)
				}
				let lowestHP = Number.MAX_SAFE_INTEGER
				let lowestUnit: ChampionUnit | undefined
				holder.alliedUnits().forEach(unit => {
					if (unit.health < lowestHP) {
						lowestHP = unit.health
						lowestUnit = unit
					}
				})
				if (lowestUnit) {
					lowestUnit.gainHealth(elapsedMS, holder, takingDamage * hextechHeal / 100, true)
				}
			}
		},
	},

	[ItemKey.IonicSpark]: {
		update: (elapsedMS, item, itemID, unit) => {
			const mrShred = item.effects['MRShred']
			const hexRadius = item.effects['HexRange']
			const durationSeconds = 0.25 //NOTE hardcoded
			if (hexRadius == null || mrShred == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const affectedUnits = unit.getInteractableUnitsWithin(hexRadius, unit.opposingTeam())
			affectedUnits.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.magicResistReduction, durationSeconds * 1000, mrShred / 100))
		},
		castWithinHexRange: (elapsedMS, item, itemID, caster, holder) => {
			if (caster.team === holder.team) { return }
			const manaRatio = item.effects['ManaRatio']
			if (manaRatio == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const damageCalculation = createDamageCalculation(item.name, manaRatio / 100 * caster.manaMax(), DamageType.magic)
			caster.damage(elapsedMS, false, holder, DamageSourceType.item, damageCalculation, false)
		},
	},

	[ItemKey.LastWhisper]: {
		damageDealtByHolder: (item, itemID, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			//TODO official implementation applies on critical strikes, this applies after any attack (since crits are averaged)
			const armorReductionPercent = item.effects['ArmorReductionPercent']
			const durationSeconds = item.effects['ArmorBreakDuration']
			if (armorReductionPercent == null || durationSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			target.applyStatusEffect(elapsedMS, StatusEffectType.armorReduction, durationSeconds * 1000, armorReductionPercent / 100)
		},
	},

	[ItemKey.LocketOfTheIronSolari]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const shieldValue = item.effects[`${holder.starLevel}StarShieldValue`]
			const shieldSeconds = item.effects['ShieldDuration']
			if (shieldValue == null || shieldSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.push(holder)
			adjacentUnits.forEach(unit => unit.shields.push({
				source: holder,
				amount: shieldValue,
				expiresAtMS: shieldSeconds * 1000,
			}))
		},
	},

	[ItemKey.Morellonomicon]: {
		damageDealtByHolder: (item, itemID, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (isOriginalSource && sourceType === DamageSourceType.spell && (damageType === DamageType.magic || damageType === DamageType.true)) {
				const ticksPerSecond = item.effects['TicksPerSecond']
				if (ticksPerSecond == null) {
					return console.log('ERR', item.name, item.effects)
				}
				applyGrievousBurn(item, elapsedMS, target, holder, ticksPerSecond)
			}
		},
	},

	[ItemKey.Quicksilver]: {
		innate: (item, holder) => {
			const shields: ShieldData[] = []
			const shieldSeconds = item.effects['SpellShieldDuration']
			if (shieldSeconds == null) {
				console.log('ERR', item.name, item.effects)
			} else {
				shields.push({
					source: holder,
					isSpellShield: true,
					amount: 0, //TODO does not break
					expiresAtMS: shieldSeconds * 1000,
				})
			}
			return { shields }
		},
	},

	[ItemKey.Redemption]: {
		update: (elapsedMS, item, itemID, holder) => {
			if (checkCooldown(elapsedMS, holder, item, itemID, true, 'HealTickRate')) {
				const aoeDamageReduction = item.effects['AoEDamageReduction']
				const missingHPHeal = item.effects['MissingHPHeal']
				const maxHeal = item.effects['MaxHeal']
				const hexDistanceFromSource = item.effects['HexRadius']
				const healTickSeconds = item.effects['HealTickRate']
				if (aoeDamageReduction == null || hexDistanceFromSource == null || missingHPHeal == null || maxHeal == null || healTickSeconds == null) {
					return console.log('ERR', item.name, item.effects)
				}
				const tickMS = healTickSeconds * 1000
				holder.queueHexEffect(elapsedMS, undefined, {
					startsAfterMS: tickMS,
					hexDistanceFromSource,
					statusEffects: {
						[StatusEffectType.aoeDamageReduction]: {
							durationMS: tickMS,
							amount: aoeDamageReduction,
						},
					},
					damageCalculation: createDamageCalculation(itemID, missingHPHeal / 100, DamageType.heal, BonusKey.MissingHealth, 1, false, maxHeal),
					targetTeam: holder.team,
				})
			}
		},
	},

	[ItemKey.RunaansHurricane]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			const boltCount = item.effects['AdditionalTargets']
			const damageMultiplier = item.effects['MultiplierForDamage']
			if (boltCount == null || damageMultiplier == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const additionalTargets = getNearestAttackableEnemies(holder, [...state.units].filter(unit => unit !== target), 99, boltCount)
			const damageCalculation = createDamageCalculation(itemID, 1, undefined, BonusKey.AttackDamage, damageMultiplier / 100)
			for (let boltIndex = 0; boltIndex < boltCount; boltIndex += 1) {
				const boltTarget = additionalTargets[boltIndex]
				if (boltTarget == null) { continue }
				holder.queueProjectileEffect(elapsedMS, undefined, {
					missile: {
						speedInitial: 1000, //TODO determine
					},
					sourceType: DamageSourceType.attack,
					target: boltTarget,
					damageCalculation,
				})
			}
		},
	},

	[ItemKey.ShroudOfStillness]: {
		apply: (item, unit) => {
			const costIncreasePercent = item.effects['CostIncrease']
			if (costIncreasePercent == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const height = HEX_PROPORTION * 6
			const center: HexCoord = [...unit.coord]
			center[1] += height / 2 * (unit.team === 0 ? 1 : -1)
			unit.queueShapeEffect(0, undefined, {
				shape: new ShapeEffectRectangle(center, [HEX_PROPORTION * 2, height]),
				bonuses: [SpellKey.ManaReave, [BonusKey.ManaReductionPercent, -costIncreasePercent]],
			})
		},
	},

	[ItemKey.StatikkShiv]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			if (!holder.isNthBasicAttack(3)) { return }
			const totalUnits = item.effects[`${holder.starLevel}StarBounces`]
			const damage = item.effects['Damage']
			const shredDurationSeconds = item.effects['MRShredDuration']
			const mrShred = item.effects['MRShred']
			if (totalUnits == null || damage == null || shredDurationSeconds == null || mrShred == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const units: ChampionUnit[] = []
			let currentBounceTarget = target
			const team = holder.opposingTeam()
			while (units.length < totalUnits) {
				units.push(currentBounceTarget)
				const newTarget = getClosestUnitOfTeamWithinRangeTo(currentBounceTarget.activeHex, team, undefined, [...state.units].filter(unit => !units.includes(unit)))
				if (!newTarget) { break }
				currentBounceTarget = newTarget
			}
			const damageCalculation = createDamageCalculation(itemID, damage, DamageType.magic)
			units.forEach(unit => {
				unit.damage(elapsedMS, false, holder, DamageSourceType.item, damageCalculation, true)
				unit.applyStatusEffect(elapsedMS, StatusEffectType.magicResistReduction, shredDurationSeconds * 1000, mrShred / 100)
			})
		},
	},

	[ItemKey.SunfireCape]: {
		update: (elapsedMS, item, itemID, holder) => {
			if (checkCooldown(elapsedMS, holder, item, itemID, true)) {
				const hexRange = item.effects['HexRange']
				if (hexRange == null) {
					return console.log('ERR', item.name, item.effects)
				}
				const units = holder.getInteractableUnitsWithin(hexRange, holder.opposingTeam())
				const bestTargets = units.filter(unit => !Array.from(unit.bleeds).some(bleed => bleed.sourceID === BURN_ID))
				let bestTarget: ChampionUnit | undefined
				if (bestTargets.length) {
					let closestDistance = Number.MAX_SAFE_INTEGER
					bestTargets.forEach(unit => {
						const hexDistance = unit.hexDistanceTo(holder)
						if (hexDistance < closestDistance) {
							closestDistance = hexDistance
							bestTarget = unit
						}
					})
				} else {
					let fewestRemainingBleeds = Number.MAX_SAFE_INTEGER
					units.forEach(unit => {
						const remainingBleeds = Array.from(unit.bleeds).find(bleed => bleed.sourceID === BURN_ID)!.remainingIterations
						if (remainingBleeds < fewestRemainingBleeds) {
							fewestRemainingBleeds = remainingBleeds
							bestTarget = unit
						}
					})
				}
				if (bestTarget) {
					applyGrievousBurn(item, elapsedMS, bestTarget, holder, 1) //NOTE ticksPerSecond is hardcoded to match Morellonomicon since it is currently unspecified
				}
			}
		},
	},

	[ItemKey.TitansResolve]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			applyTitansResolve(item, itemID, holder)
		},
		damageTaken: (elapsedMS, item, itemID, isOriginalSource, holder, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (isOriginalSource) {
				applyTitansResolve(item, itemID, holder)
			}
		},
	},

	[ItemKey.ZekesHerald]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const bonusAS = item.effects['AS']
			if (bonusAS === undefined) {
				return console.log('ERR', item.name, item.effects)
			}
			adjacentUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, [BonusKey.AttackSpeed, bonusAS]))
		},
	},

	[ItemKey.Zephyr]: {
		apply: (item, unit) => {
			const banishSeconds = item.effects['BanishDuration']
			if (banishSeconds == null) {
				return console.log('ERR', item.name, item.effects)
			}
			const targetHex = getInverseHex(unit.startHex)
			const target = getClosestUnitOfTeamWithinRangeTo(targetHex, unit.opposingTeam(), undefined, state.units) //TODO not random
			if (target) {
				target.applyStatusEffect(0, StatusEffectType.banished, banishSeconds * 1000)
			}
		},
	},

	[ItemKey.ZzRotPortal]: {
		apply: (item, unit) => {
			unit.queueHexEffect(0, undefined, {
				startsAfterMS: 4100, //TODO determine
				hexDistanceFromSource: 1, //TODO pathing to target is not yet supported
				damageMultiplier: 0.5,
				taunts: true,
			})
		},
		deathOfHolder: (elapsedMS, item, itemID, unit) => {
			const hex = getClosestHexAvailableTo(unit.activeHex, state.units)
			if (hex) {
				const voidling = new ChampionUnit(ChampionKey.VoidSpawn, hex, 1)
				voidling.genericReset()
				voidling.team = unit.team
				state.units.push(voidling)
				needsPathfindingUpdate()
				voidling.queueHexEffect(elapsedMS, undefined, {
					startsAfterMS: 500,
					hexDistanceFromSource: 1,
					damageMultiplier: 0.5,
					taunts: true,
				})
			}
		},
	},

} as { [key in ItemKey]?: ItemFns }

function applyTitansResolve(item: ItemData, itemID: any, unit: ChampionUnit) {
	const stackAD = item.effects['StackingAD']
	const stackAP = item.effects['StackingAP']
	const maxStacks = item.effects['StackCap']
	const resistsAtCap = item.effects['BonusResistsAtStackCap']
	if (stackAD === undefined || stackAP === undefined || maxStacks == null || resistsAtCap === undefined) {
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

function applyGrievousBurn(item: ItemData, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit, ticksPerSecond: number) {
	const grievousWounds = item.effects['GrievousWoundsPercent']
	const totalBurn = item.effects['BurnPercent']
	const durationSeconds = item.effects['BurnDuration']
	if (grievousWounds == null || totalBurn == null || durationSeconds == null || ticksPerSecond == null) {
		return console.log('ERR', item.name, item.effects)
	}
	target.applyStatusEffect(elapsedMS, StatusEffectType.grievousWounds, durationSeconds * 1000, grievousWounds / 100)

	const existing = Array.from(target.bleeds).find(bleed => bleed.sourceID === BURN_ID)
	const repeatsEverySeconds = 1 / ticksPerSecond
	const repeatsEveryMS = repeatsEverySeconds * 1000
	const tickCount = durationSeconds / repeatsEverySeconds
	const damage = totalBurn / tickCount / 100
	const damageCalculation = createDamageCalculation(BURN_ID, damage, DamageType.true, BonusKey.Health, 1)
	if (existing) {
		existing.remainingIterations = tickCount
		existing.damageCalculation = damageCalculation
		existing.source = source
		existing.repeatsEveryMS = repeatsEveryMS
	} else {
		target.bleeds.add({
			sourceID: BURN_ID,
			source,
			damageCalculation,
			activatesAtMS: elapsedMS + repeatsEveryMS,
			repeatsEveryMS,
			remainingIterations: tickCount,
		})
	}
}
