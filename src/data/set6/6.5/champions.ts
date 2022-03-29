import { BonusKey, ChampionKey } from '@tacticians-academy/academy-library'
import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { ShapeEffectCircle } from '#/game/effects/ShapeEffect'
import { state } from '#/game/store'

import { getBestArrayAsMax, getBestAsMax, getBestRandomAsMax, getDistanceHex, getDistanceUnit, getInteractableUnitsOfTeam, getProjectileSpread } from '#/helpers/abilityUtils'
import { toRadians } from '#/helpers/angles'
import { getDistanceUnitOfTeamWithinRangeTo, getHotspotHexes, getProjectedHexLineFrom } from '#/helpers/boardUtils'
import { HEX_MOVE_LEAGUEUNITS, MAX_HEX_COUNT } from '#/helpers/constants'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { ChampionEffects, HexCoord } from '#/helpers/types'
import { randomItem } from '#/helpers/utils'

import { baseChampionEffects } from '../champions'

export const championEffects = {

	...baseChampionEffects,

	[ChampionKey.Ahri]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.wasInRangeOfTarget) { return false }
			const missileSpell = champion.getSpellFor('OrbMissile')
			const degreesBetweenOrbs = champion.getSpellVariable(spell, 'AngleBetweenOrbs' as SpellKey)
			const radiansBetweenOrbs = toRadians(degreesBetweenOrbs)
			const multiOrbProportion = champion.getSpellVariable(spell, 'MultiOrbDamage' as SpellKey)
			const orbsPerCast = champion.getSpellVariable(spell, 'SpiritFireStacks' as SpellKey)
			const maxRange = champion.getSpellVariable(spell, 'HexRange' as SpellKey)
			const orbCount = champion.castCount * orbsPerCast + 1
			getProjectileSpread(orbCount, radiansBetweenOrbs).forEach(changeRadians => {
				champion.queueProjectileEffect(elapsedMS, spell, {
					fixedHexRange: maxRange,
					destroysOnCollision: false,
					modifiesOnMultiHit: true,
					damageModifier: {
						multiplier: multiOrbProportion - 1,
					},
					changeRadians,
					missile: missileSpell?.missile,
					returnMissile: champion.getSpellFor('OrbReturn')?.missile ?? missileSpell?.missile,
					targetDeathAction: 'continue',
				})
			})
			return true
		},
	},

	[ChampionKey.Alistar]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			const checkingUnits = state.units.filter(unit => unit !== champion && unit !== target)
			let targetHex: HexCoord | undefined
			const moveSpeed = 1000 //TODO experimentally determine
			const knockupSeconds = champion.getSpellVariable(spell, 'KnockupDuration' as SpellKey)
			champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				targetTeam: target.team,
				ignoresDestinationCollision: true,
				idealDestination: () => {
					const hexLineThroughTarget = getProjectedHexLineFrom(champion, target, state.hexRowsCols)
					const availableInLine = hexLineThroughTarget.filter(hex => !checkingUnits.some(unit => unit.isAt(hex)))
					const championHex = availableInLine.pop()
					targetHex = availableInLine.pop()
					return championHex ?? target.activeHex
				},
				moveSpeed,
				onCollision: (elapsedMS, withUnit) => {
					if (withUnit === target) {
						if (targetHex) {
							target.customMoveTo(targetHex ?? target, true, moveSpeed, (elapsedMS, target) => {
								const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
								target.applyStatusEffect(elapsedMS, StatusEffectType.stunned, stunSeconds * 1000)
							})
						}
					}
				},
				hexEffect: {
					hexDistanceFromSource: 2,
					statusEffects: [
						[StatusEffectType.stunned, { durationMS: knockupSeconds * 1000 }],
					],
				},
			})
			return true
		},
	},

	[ChampionKey.Ashe]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.target) { return false }
			const arrowCount = champion.getSpellVariable(spell, 'NumOfArrows' as SpellKey)
			const attackSpeedPercent = champion.getSpellVariable(spell, 'ASReduction' as SpellKey)
			const slowSeconds = champion.getSpellCalculationResult(spell, SpellKey.Duration)
			const radiansBetweenOrbs = toRadians(10) //NOTE hardcoded
			const fixedHexRange = champion.range() + 1
			getProjectileSpread(arrowCount, radiansBetweenOrbs).forEach(changeRadians => {
				champion.queueProjectileEffect(elapsedMS, spell, {
					fixedHexRange,
					destroysOnCollision: false,
					changeRadians,
					statusEffects: [
						[StatusEffectType.attackSpeedSlow, { amount: attackSpeedPercent, durationMS: slowSeconds * 1000 }],
					],
				})
			})
			return true
		},
	},

	[ChampionKey.Brand]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion, champion.opposingTeam())
			if (!target) { return false }
			const blazeSeconds = champion.getSpellVariable(spell, 'BlazeDuration' as SpellKey)
			// const vip = champion.getSpellVariable(spell, 'VIPBonusReducedDamage' as SpellKey) //TODO VIP
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				destroysOnCollision: true,
				onCollision: (elapsedMS, target) => {
					if (target.statusEffects.ablaze.active) {
						target.statusEffects.ablaze.active = false
						const bonusCalculation = champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey)
						if (bonusCalculation) {
							target.takeBonusDamage(elapsedMS, champion, bonusCalculation, false)
						}
						const secondProcStunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
						target.applyStatusEffect(elapsedMS, StatusEffectType.stunned, secondProcStunSeconds * 1000)
					} else {
						target.applyStatusEffect(elapsedMS, StatusEffectType.ablaze, blazeSeconds * 1000)
					}
				},
			})
		},
	},

	[ChampionKey.Corki]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRange = 1 //NOTE hardcoded
			return champion.queueProjectileEffect(elapsedMS, spell, {
				hexEffect: {
					hexDistanceFromSource: hexRange,
				},
			})
		},
	},

	[ChampionKey.Gnar]: {
		cast: (elapsedMS, spell, champion) => {
			const boulderSpell = champion.data.spells[1]
			if (!champion.castCount) {
				const rangeReduction = 2 //NOTE hardcoded
				const transformSeconds = champion.getSpellVariable(spell, 'TransformDuration' as SpellKey)
				const bonusHealth = champion.getSpellCalculationResult(spell, 'TransformHealth' as SpellKey)
				const manaReduction = champion.getSpellVariable(spell, 'TransformManaReduc' as SpellKey)
				const expiresAt = elapsedMS + transformSeconds * 1000
				champion.increaseMaxHealthBy(bonusHealth)
				champion.setBonusesFor(ChampionKey.Gnar, [BonusKey.ManaReduction, manaReduction, expiresAt], [BonusKey.HexRangeIncrease, -rangeReduction, expiresAt])
				if (champion.target) {
					const jumpToHex = champion.projectHexFrom(champion.target, false)
					if (jumpToHex) {
						champion.customMoveTo(jumpToHex, false, 1000) //TODO travel time
					}
				}
			}
			const fixedHexRange = champion.data.stats.range
			const target = getDistanceUnitOfTeamWithinRangeTo(true, champion, champion.opposingTeam(), fixedHexRange)
			if (!target) { return true } //TODO
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				missile: boulderSpell.missile,
				fixedHexRange,
				destroysOnCollision: false,
			})
		},
	},

	[ChampionKey.Irelia]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			const moveSpeed = 2000 //TODO experimentally determine
			champion.manaLockUntilMS = Number.MAX_SAFE_INTEGER
			return ireliaResetRecursive(spell, champion, moveSpeed, target)
		},
	},

	[ChampionKey.JarvanIV]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRadius = champion.getSpellVariable(spell, 'HexRadius' as SpellKey)
			const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const attackSpeedProportion = champion.getSpellVariable(spell, 'ASPercent' as SpellKey)
			return champion.queueHexEffect(elapsedMS, spell, {
				targetTeam: champion.team,
				hexDistanceFromSource: hexRadius,
				bonuses: [champion.instanceID as ChampionKey, [BonusKey.AttackSpeed, attackSpeedProportion * 100, elapsedMS + durationSeconds * 1000]],
			})
		},
	},

	[ChampionKey.KhaZix]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.target) { return false }
			const manaReave = champion.getSpellVariable(spell, SpellKey.ManaReave)
			const jumpMS = champion.getSpellVariable(spell, 'MSBuff' as SpellKey)
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				targetTeam: champion.team,
				idealDestination: (champion) => {
					const validUnits = getInteractableUnitsOfTeam(champion.opposingTeam()).filter(unit => unit !== champion.target)
					const bestUnits = getBestArrayAsMax(false, validUnits, (unit) => unit.health)
					return getBestRandomAsMax(true, bestUnits, (unit) => unit.coordDistanceSquaredTo(champion)) ?? champion.target
				},
				moveSpeed: jumpMS, //TODO fixed move time
				onCollision: (elapsedMS, champion) => {
					champion.queueProjectileEffect(elapsedMS, spell, {
						bonuses: [SpellKey.ManaReave, [BonusKey.ManaReductionPercent, -manaReave]],
					})
				},
			})
		},
	},

	[ChampionKey.Morgana]: {
		cast: (elapsedMS, spell, champion) => {
			const shieldAmount = champion.getSpellCalculationResult(spell, 'ShieldAmount' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'ShieldDuration' as SpellKey)
			const targetsInHexRange = champion.getSpellVariable(spell, 'Radius' as SpellKey)
			const expiresAfterMS = shieldSeconds * 1000
			const tickEveryMS = 1000
			const effect = champion.queueTargetEffect(elapsedMS, spell, {
				targetsInHexRange,
				damageCalculation: champion.getSpellCalculation(spell, 'DamagePerSecond' as SpellKey),
				tickEveryMS,
				expiresAfterMS,
			})
			champion.queueShield(elapsedMS, champion, {
				amount: shieldAmount,
				expiresAfterMS,
				onRemoved: (elapsedMS, shield) => {
					if (shield.amount > 0) {
						if (effect) {
							const stunMS = champion.getSpellVariable(spell, SpellKey.StunDuration) * 1000
							effect.currentTargets.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, stunMS))
						}
					} else {
						const manaRefund = champion.getSpellVariable(spell, 'RefundedMana' as SpellKey)
						champion.addMana(manaRefund)
					}
				},
			})
			return true
		},
	},

	[ChampionKey.Nocturne]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const durationMS = stunSeconds * 1000
			const tickEveryMS = 100 //TODO verify
			return champion.queueTargetEffect(elapsedMS, spell, {
				tickEveryMS,
				expiresAfterMS: durationMS,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS }],
				],
			})
		},
	},

	[ChampionKey.Renata]: {
		cast: (elapsedMS, spell, champion) => {
			const targetTeam = champion.opposingTeam()
			const fixedHexRange = champion.getSpellVariable(spell, 'SpellRange' as SpellKey)
			const validUnits = getInteractableUnitsOfTeam(targetTeam).filter(unit => unit.hexDistanceTo(champion) <= fixedHexRange)
			const bestHex = randomItem(getHotspotHexes(true, validUnits, targetTeam, 1)) //TODO experimentally determine
			if (!bestHex) { return false }
			const attackSpeedReducePercent = champion.getSpellVariable(spell, 'ASReduction' as SpellKey)
			const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const damageCalculation = champion.getSpellCalculation(spell, 'DamagePerSecond' as SpellKey)!
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: bestHex,
				fixedHexRange,
				destroysOnCollision: false,
				onCollision: (elapsedMS, unit) => {
					unit.setBonusesFor(ChampionKey.Renata, [BonusKey.AttackSpeed, -attackSpeedReducePercent, elapsedMS + durationSeconds * 1000])
					unit.bleeds.add({
						sourceID: Math.random().toString(),
						source: champion,
						damageCalculation,
						activatesAtMS: elapsedMS,
						repeatsEveryMS: 1000, //NOTE hardcoded
						remainingIterations: durationSeconds,
					})
				},
			})
		},
	},

	[ChampionKey.Senna]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.target) { return false }
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: MAX_HEX_COUNT,
				hasBackingVisual: true,
				onCollision: (elapsedMS, unit, damage) => {
					if (damage == null) { return }
					const lowestHPAlly = getBestAsMax(false, champion.alliedUnits(true), (unit) => unit.health)
					if (lowestHPAlly) {
						const percentHealing = champion.getSpellCalculationResult(spell, 'PercentHealing' as SpellKey)
						lowestHPAlly.gainHealth(elapsedMS, champion, damage * percentHealing / 100, true)
					}
				},
			})
		},
	},

	[ChampionKey.Sivir]: {
		cast: (elapsedMS, spell, champion) => {
			const empowerSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const bounceCount = champion.getSpellVariable(spell, 'NumBounces' as SpellKey)
			const maxHexRangeFromOriginalTarget = champion.getSpellVariable(spell, 'BounceRange' as SpellKey)
			const damageCalculation = champion.getSpellCalculation(spell, 'DamageCalc' as SpellKey)
			const attackSpeedProportion = champion.getSpellCalculationResult(spell, 'BonusAttackSpeed' as SpellKey)
			const expiresAtMS = elapsedMS + empowerSeconds * 1000
			champion.setBonusesFor(ChampionKey.Sivir, [BonusKey.AttackSpeed, attackSpeedProportion, expiresAtMS])
			champion.empoweredAutos.add({
				amount: 99,
				expiresAtMS,
				bounce: {
					maxHexRangeFromOriginalTarget,
					bouncesRemaining: bounceCount,
					damageCalculation,
				},
			})
			champion.manaLockUntilMS = expiresAtMS
			return true
		},
	},

	[ChampionKey.Tryndamere]: {
		cast: (elapsedMS, spell, champion) => {
			const densestEnemyHexes = getHotspotHexes(true, state.units, champion.opposingTeam(), 1)
			const farthestDenseHex = getDistanceHex(true, champion, densestEnemyHexes)
			if (!farthestDenseHex) { console.log('ERR', champion.name, spell.name, densestEnemyHexes) }
			const projectedHex = champion.projectHexFromHex(farthestDenseHex ?? champion.activeHex, true)
			if (!projectedHex) { console.log('ERR', champion.name, spell.name, farthestDenseHex) }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS),
				expiresAfterMS: 0.5 * 1000, //TODO calculate
				onActivate: (elapsedMS, champion) => {
					champion.customMoveTo(projectedHex ?? champion, false, 2000) //TODO experimentally determine
					champion.empoweredAutos.add({
						amount: 3, //NOTE hardcoded
						damageModifier: {
							multiplier: champion.getSpellVariable(spell, 'BonusAAPercent' as SpellKey),
						},
					})
				},
			})
		},
	},

} as ChampionEffects

function ireliaResetRecursive(spell: ChampionSpellData, champion: ChampionUnit, moveSpeed: number, target: ChampionUnit) {
	champion.customMoveTo(target, false, moveSpeed, (elapsedMS, champion) => {
		if (target.isAttackable()) {
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			if (damageCalculation) {
				target.damage(elapsedMS, true, champion, DamageSourceType.spell, damageCalculation, false)
				if (target.dead) {
					const newTarget = getBestAsMax(false, getInteractableUnitsOfTeam(target.team), (unit) => unit.health)
					if (newTarget) {
						return ireliaResetRecursive(spell, champion, moveSpeed, newTarget)
					}
				}
			}
		}
		champion.customMoveTo(target, true, moveSpeed, (elapsedMS, champion) => {
			champion.manaLockUntilMS = 0
		})
	})
	return true
}
