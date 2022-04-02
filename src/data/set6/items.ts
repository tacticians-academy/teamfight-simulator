import { ChampionKey, ItemKey, BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { ShapeEffectRectangle } from '#/game/effects/ShapeEffect'

import { applyGrievousBurn, getChainFrom, getInteractableUnitsOfTeam, getVariables, GRIEVOUS_BURN_ID, spawnUnit, getDistanceUnitFromUnits, checkCooldownFor, getUnitsOfTeam, getAttackableUnitsOfTeam, getDistanceUnitsOfTeam } from '#/helpers/abilityUtils'
import { getInverseHex, getDistanceUnitOfTeamWithinRangeTo } from '#/helpers/boardUtils'
import type { SurroundingHexRange } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { HEX_PROPORTION } from '#/helpers/constants'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { BonusLabelKey, BonusVariable, HexCoord, ItemEffects } from '#/helpers/types'
import { getBestRandomAsMax, getBestSortedAsMax } from '#/helpers/utils'

export const baseItemEffects = {

	[ItemKey.ArchangelsStaff]: {
		innate: (item, unit) => {
			const [intervalAmount, intervalSeconds] = getVariables(item, 'APPerInterval', 'IntervalSeconds')
			unit.scalings.add({
				source: unit,
				sourceID: item.name as ItemKey,
				activatedAtMS: 0,
				stats: [BonusKey.AbilityPower],
				intervalAmount,
				intervalSeconds,
			})
		},
	},

	[ItemKey.BansheesClaw]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const [shieldAmount] = getVariables(item, 'ShieldHP')
			adjacentUnits.push(holder)
			adjacentUnits.forEach(unit => unit.queueShield(0, holder, {
				type: 'spellShield',
				amount: shieldAmount,
			}))
		},
	},

	[ItemKey.Bloodthirster]: {
		hpThreshold: (elapsedMS, item, itemID, holder) => {
			const [shieldHPPercent, shieldSeconds] = getVariables(item, 'ShieldHPPercent', 'ShieldDuration')
			holder.queueShield(elapsedMS, holder, {
				amount: shieldHPPercent / 100 * holder.healthMax,
				expiresAfterMS: shieldSeconds * 1000,
			})
		},
	},

	[ItemKey.BrambleVest]: {
		damageTaken: (elapsedMS, item, itemID, holder, source, { isOriginalSource, sourceType }) => {
			if (isOriginalSource && sourceType === DamageSourceType.attack && checkCooldownFor(elapsedMS, holder, item, itemID, true)) {
				const [aoeDamage] = getVariables(item, `${holder.starLevel}StarAoEDamage`)
				holder.getInteractableUnitsWithin(1, holder.opposingTeam()).forEach(unit => {
					const damageCalculation = createDamageCalculation(item.name, aoeDamage, DamageType.magic)
					unit.takeBonusDamage(elapsedMS, holder, damageCalculation, true)
				})
			}
		},
	},

	[ItemKey.ChaliceOfPower]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const [bonusAP] = getVariables(item, 'BonusAP')
			adjacentUnits.forEach(unit => unit.addBonuses(item.name as ItemKey, [BonusKey.AbilityPower, bonusAP]))
		},
	},

	[ItemKey.DragonsClaw]: {
		damageTaken: (elapsedMS, item, itemID, holder, source, { isOriginalSource, sourceType, damageType }) => {
			if (source && isOriginalSource && sourceType === DamageSourceType.spell && damageType !== DamageType.physical && checkCooldownFor(elapsedMS, holder, item, itemID, true)) {
				holder.queueProjectileEffect(elapsedMS, undefined, {
					target: source,
					damageCalculation: createDamageCalculation(item.name, 0.18, DamageType.magic, BonusKey.Health, true, 1),
					damageSourceType: DamageSourceType.bonus,
					missile: {
						speedInitial: 500, //TODO experimentally determine
					},
				})
			}
		},
	},

	[ItemKey.FrozenHeart]: {
		update: (elapsedMS, item, itemID, unit) => {
			const [attackSpeedPercent, hexRadius] = getVariables(item, 'ASSlow', 'HexRadius')
			const durationSeconds = 0.5 //NOTE hardcoded apparently??
			const affectedUnits = unit.getInteractableUnitsWithin(hexRadius as SurroundingHexRange, unit.opposingTeam())
			affectedUnits.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.attackSpeedSlow, durationSeconds * 1000, attackSpeedPercent))
		},
	},

	[ItemKey.GargoyleStoneplate]: {
		update: (elapsedMS, item, itemID, unit) => {
			const [perEnemyArmor, perEnemyMR] = getVariables(item, 'ArmorPerEnemy', 'MRPerEnemy')
			const unitsTargeting = getInteractableUnitsOfTeam(unit.opposingTeam())
				.filter(enemy => enemy.target === unit)
				.length
			unit.setBonusesFor(itemID as BonusLabelKey, [BonusKey.Armor, perEnemyArmor * unitsTargeting], [BonusKey.MagicResist, perEnemyMR * unitsTargeting])
		},
	},

	[ItemKey.GiantSlayer]: {
		modifyDamageByHolder: (item, target, holder, damage) => {
			if (damage.isOriginalSource && (damage.sourceType === DamageSourceType.attack || damage.sourceType === DamageSourceType.spell)) {
				const [thresholdHP, smallBonusPct, largeBonusPct] = getVariables(item, 'HPThreshold', 'SmallBonusPct', 'LargeBonusPct')
				const bonusPercent = target.healthMax >= thresholdHP ? largeBonusPct : smallBonusPct
				if (bonusPercent > 0) {
					damage.rawDamage *= 1 + bonusPercent / 100
				}
			}
		},
	},

	[ItemKey.GuinsoosRageblade]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			const [perStackAS] = getVariables(item, 'ASPerStack')
			holder.addBonuses(itemID as BonusLabelKey, [BonusKey.AttackSpeed, perStackAS])
		},
	},

	[ItemKey.HandOfJustice]: {
		damageDealtByHolder: (item, itemID, elapsedMS, target, holder, { sourceType, takingDamage }) => {
			if (sourceType === DamageSourceType.attack || sourceType === DamageSourceType.spell) {
				const [baseHeal, increaseEffect] = getVariables(item, 'BaseHeal', 'AdditionalHeal')
				holder.gainHealth(elapsedMS, holder, takingDamage * (baseHeal + increaseEffect / 2) / 100, true) //TODO averaged increaseEffect
			}
		},
		innate: (item, unit) => {
			const [increaseEffect] = getVariables(item, 'AdditionalADAP')
			const increase = increaseEffect / 2 //TODO averaged increaseEffect
			return [
				[BonusKey.AbilityPower, increase], [BonusKey.AttackDamage, increase],
			]
		},
	},

	[ItemKey.HextechGunblade]: {
		damageDealtByHolder: (item, itemID, elapsedMS, target, holder, { damageType, takingDamage }) => {
			if (damageType !== DamageType.physical) {
				const [hextechHeal] = getVariables(item, BonusKey.VampSpell)
				const lowestHPAlly = getBestRandomAsMax(false, holder.alliedUnits(true), (unit) => unit.health)
				if (lowestHPAlly) {
					lowestHPAlly.gainHealth(elapsedMS, holder, takingDamage * hextechHeal / 100, true)
				}
			}
		},
	},

	[ItemKey.IonicSpark]: {
		update: (elapsedMS, item, itemID, unit) => {
			const [mrShred, hexRadius] = getVariables(item, 'MRShred', 'HexRange')
			const durationSeconds = 0.25 //NOTE hardcoded
			const affectedUnits = unit.getInteractableUnitsWithin(hexRadius as SurroundingHexRange, unit.opposingTeam())
			affectedUnits.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.magicResistReduction, durationSeconds * 1000, mrShred / 100))
		},
		castWithinHexRange: (elapsedMS, item, itemID, caster, holder) => {
			if (caster.team === holder.team) { return }
			const [manaRatio] = getVariables(item, 'ManaRatio')
			const damageCalculation = createDamageCalculation(item.name, manaRatio / 100 * caster.manaMax(), DamageType.magic)
			caster.takeBonusDamage(elapsedMS, holder, damageCalculation, false)
		},
	},

	[ItemKey.LastWhisper]: {
		damageDealtByHolder: (item, itemID, elapsedMS, target, holder, damage) => {
			//TODO official implementation applies on critical strikes, this applies after any attack (since crits are averaged)
			const [armorReductionPercent, durationSeconds] = getVariables(item, 'ArmorReductionPercent', 'ArmorBreakDuration')
			target.applyStatusEffect(elapsedMS, StatusEffectType.armorReduction, durationSeconds * 1000, armorReductionPercent / 100)
		},
	},

	[ItemKey.LocketOfTheIronSolari]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const [shieldValue, shieldSeconds] = getVariables(item, `${holder.starLevel}StarShieldValue`, 'ShieldDuration')
			adjacentUnits.push(holder)
			adjacentUnits.forEach(unit => unit.queueShield(0, holder, {
				amount: shieldValue,
				expiresAfterMS: shieldSeconds * 1000,
			}))
		},
	},

	[ItemKey.Morellonomicon]: {
		damageDealtByHolder: (item, itemID, elapsedMS, target, holder, { isOriginalSource, sourceType, damageType }) => {
			if (isOriginalSource && sourceType === DamageSourceType.spell && (damageType === DamageType.magic || damageType === DamageType.true)) {
				const [ticksPerSecond] = getVariables(item, 'TicksPerSecond')
				applyGrievousBurn(item, elapsedMS, target, holder, ticksPerSecond)
			}
		},
	},

	[ItemKey.Quicksilver]: {
		innate: (item, holder) => {
			const [shieldSeconds] = getVariables(item, 'SpellShieldDuration')
			holder.queueShield(0, holder, {
				type: 'spellShield',
				expiresAfterMS: shieldSeconds * 1000,
			})
		},
	},

	[ItemKey.Redemption]: {
		update: (elapsedMS, item, itemID, holder) => {
			if (checkCooldownFor(elapsedMS, holder, item, itemID, true, 'HealTickRate')) {
				const [aoeDamageReduction, missingHPHeal, maxHeal, hexDistanceFromSource, healTickSeconds] = getVariables(item, 'AoEDamageReduction', 'MissingHPHeal', 'MaxHeal', 'HexRadius', 'HealTickRate')
				const tickMS = healTickSeconds * 1000
				holder.queueHexEffect(elapsedMS, undefined, {
					startsAfterMS: tickMS,
					hexDistanceFromSource: hexDistanceFromSource as SurroundingHexRange,
					statusEffects: [
						[StatusEffectType.aoeDamageReduction, { durationMS: tickMS, amount: aoeDamageReduction }],
					],
					damageCalculation: createDamageCalculation(itemID, missingHPHeal / 100, DamageType.heal, BonusKey.MissingHealth, true, 1, false, maxHeal),
					targetTeam: holder.team,
				})
			}
		},
	},

	[ItemKey.RunaansHurricane]: {
		basicAttack: (elapsedMS, item, itemID, target, holder, canReProc) => {
			const [boltCount, boltMultiplier] = getVariables(item, 'AdditionalTargets', 'MultiplierForDamage')
			const additionalTargets = getDistanceUnitsOfTeam(false, target, target.team)
				.slice(0, boltCount)
			const damageCalculation = createDamageCalculation(itemID, 1, undefined, BonusKey.AttackDamage, false, boltMultiplier / 100) //TODO verify
			for (let boltIndex = 0; boltIndex < boltCount; boltIndex += 1) {
				const boltTarget = additionalTargets[boltIndex]
				if (boltTarget == null) { continue }
				holder.queueProjectileEffect(elapsedMS, undefined, {
					missile: {
						speedInitial: 1000, //TODO determine
					},
					target: boltTarget,
					damageSourceType: DamageSourceType.attack,
					damageCalculation,
				})
			}
		},
	},

	[ItemKey.ShroudOfStillness]: {
		apply: (item, unit) => {
			const [costIncreasePercent] = getVariables(item, 'CostIncrease')
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
			const [totalUnits, damage, mrShred, shredDurationSeconds] = getVariables(item, `${holder.starLevel}StarBounces`, 'Damage', 'MRShred', 'MRShredDuration')
			const units = getChainFrom(target, totalUnits)
			const damageCalculation = createDamageCalculation(itemID, damage, DamageType.magic)
			units.forEach(unit => {
				unit.takeBonusDamage(elapsedMS, holder, damageCalculation, true)
				unit.applyStatusEffect(elapsedMS, StatusEffectType.magicResistReduction, shredDurationSeconds * 1000, mrShred / 100)
			})
		},
	},

	[ItemKey.SunfireCape]: {
		update: (elapsedMS, item, itemID, holder) => {
			if (checkCooldownFor(elapsedMS, holder, item, itemID, true)) {
				const [hexRange] = getVariables(item, 'HexRange')
				const units = holder.getInteractableUnitsWithin(hexRange as SurroundingHexRange, holder.opposingTeam())
				const bestTargets = units.filter(unit => !Array.from(unit.bleeds).some(bleed => bleed.sourceID === GRIEVOUS_BURN_ID))
				let bestTarget: ChampionUnit | undefined
				if (bestTargets.length) {
					bestTarget = getDistanceUnitFromUnits(false, holder, bestTargets)
				} else {
					bestTarget = getBestRandomAsMax(false, units, (unit) => Array.from(unit.bleeds).find(bleed => bleed.sourceID === GRIEVOUS_BURN_ID)!.remainingIterations)
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
		damageTaken: (elapsedMS, item, itemID, holder, source, { isOriginalSource }) => {
			if (isOriginalSource) {
				applyTitansResolve(item, itemID, holder)
			}
		},
	},

	[ItemKey.ZekesHerald]: {
		adjacentHexBuff: (item, holder, adjacentUnits) => {
			const [bonusAS] = getVariables(item, BonusKey.AttackSpeed)
			adjacentUnits.forEach(unit => unit.addBonuses(item.name as ItemKey, [BonusKey.AttackSpeed, bonusAS]))
		},
	},

	[ItemKey.Zephyr]: {
		apply: (item, unit) => {
			const [banishSeconds] = getVariables(item, 'BanishDuration')
			const targetHex = getInverseHex(unit.startHex)
			const units = getUnitsOfTeam(unit.opposingTeam()).filter(unit => !unit.isUnstoppable())
			const target = getDistanceUnitOfTeamWithinRangeTo(false, targetHex, undefined, units) //TODO not random
			if (target) {
				target.applyStatusEffect(0, StatusEffectType.banished, banishSeconds * 1000)
			}
		},
	},

	[ItemKey.ZzRotPortal]: {
		apply: (item, unit) => {
			unit.queueHexEffect(0, undefined, {
				startsAfterMS: 4100, //TODO determine
				hexDistanceFromSource: 4,
				opacity: 0.5,
				taunts: true,
			})
		},
		deathOfHolder: (elapsedMS, item, itemID, unit) => {
			const voidling = spawnUnit(unit, ChampionKey.VoidSpawn, 1)
			voidling.queueHexEffect(elapsedMS, undefined, {
				startsAfterMS: 500, //TODO experimentally determine
				hexDistanceFromSource: 1,
				opacity: 0.5,
				taunts: true,
			})
		},
	},

} as ItemEffects

function applyTitansResolve(item: ItemData, itemID: any, unit: ChampionUnit) {
	const [stackAD, stackAP, maxStacks, resistsAtCap] = getVariables(item, 'StackingAD', 'StackingAP', 'StackCap', 'BonusResistsAtStackCap')
	const bonuses = unit.getBonusesFrom(itemID)
	if (bonuses.length < maxStacks) {
		const variables: BonusVariable[] = [
			[BonusKey.AttackDamage, stackAD],
			[BonusKey.AbilityPower, stackAP],
		]
		if (bonuses.length === maxStacks - 1) {
			variables.push([BonusKey.Armor, resistsAtCap], [BonusKey.MagicResist, resistsAtCap])
		}
		unit.addBonuses(itemID, ...variables)
	}
}
