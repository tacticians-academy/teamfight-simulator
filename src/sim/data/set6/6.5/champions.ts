import { BonusKey, ChampionKey } from '@tacticians-academy/academy-library'
import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import { state } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { delayUntil } from '#/sim/loop'

import type { ChampionEffects } from '#/sim/data/types'
import { ShapeEffectCircle, ShapeEffectCone } from '#/sim/effects/ShapeEffect'

import { toRadians } from '#/sim/helpers/angles'
import { getDistanceUnitOfTeamWithinRangeTo, getBestHexWithinRangeTo, getBestDensityHexes, getProjectedHexLineFrom, getHexRing, getHexesSurroundingWithin } from '#/sim/helpers/board'
import type { SurroundingHexRange } from '#/sim/helpers/board'
import { DEFAULT_CAST_SECONDS, HEX_MOVE_LEAGUEUNITS, MAX_HEX_COUNT } from '#/sim/helpers/constants'
import { getAttackableUnitsOfTeam, getDistanceHex, getDistanceUnitOfTeam, getInteractableUnitsOfTeam, getProjectileSpread } from '#/sim/helpers/effectUtils'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/sim/helpers/types'
import type { BonusLabelKey, HexCoord, ShieldData } from '#/sim/helpers/types'
import { getBestArrayAsMax, getBestRandomAsMax, getBestSortedAsMax, randomItem } from '#/sim/helpers/utils'

import { baseChampionEffects } from '../champions'

export const championEffects = {

	...baseChampionEffects,

	[ChampionKey.Ahri]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.wasInRangeOfTarget) { return false }
			const missileSpell = champion.getSpellWithSuffix('OrbMissile')
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
					returnMissile: champion.getSpellWithSuffix('OrbReturn')?.missile ?? missileSpell?.missile,
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
				onCollision: (elapsedMS, effect, withUnit) => {
					if (withUnit === target) {
						if (targetHex) {
							target.customMoveTo(targetHex ?? target, true, moveSpeed, false, (elapsedMS, target) => {
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
			const target = getDistanceUnitOfTeam(false, champion, champion.opposingTeam())
			if (!target) { return false }
			const blazeSeconds = champion.getSpellVariable(spell, 'BlazeDuration' as SpellKey)
			// const vip = champion.getSpellVariable(spell, 'VIPBonusReducedDamage' as SpellKey) //TODO VIP
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				destroysOnCollision: true,
				onCollision: (elapsedMS, effect, withUnit) => {
					if (withUnit.statusEffects.ablaze.active) {
						withUnit.statusEffects.ablaze.active = false
						const bonusCalculation = champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey)
						if (bonusCalculation) {
							withUnit.takeBonusDamage(elapsedMS, champion, bonusCalculation, false)
						}
						const secondProcStunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
						withUnit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, secondProcStunSeconds * 1000)
					} else {
						withUnit.applyStatusEffect(elapsedMS, StatusEffectType.ablaze, blazeSeconds * 1000)
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

	[ChampionKey.Draven]: {
		innate: (spell, champion) => {
			const armorPenPercent = champion.getSpellVariable(spell, 'ArmorPenPercent' as SpellKey)
			// const vip = champion.getSpellVariable(spell, 'PassiveArmorPenPercent' as SpellKey) //TODO VIP
			return [
				[BonusKey.ArmorShred, armorPenPercent / 100],
			]
		},
		cast: (elapsedMS, spell, champion) => {
			addDravenAxe(elapsedMS, spell, champion)
			return true
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
				champion.setBonusesFor(spell.name as SpellKey, [BonusKey.ManaReduction, manaReduction, expiresAt], [BonusKey.HexRangeIncrease, -rangeReduction, expiresAt])
				if (champion.target) {
					const jumpToHex = champion.projectHexFrom(champion.target, false, 1)
					if (jumpToHex) {
						champion.customMoveTo(jumpToHex, false, 1000, false) //TODO travel time
					}
				}
			}
			const fixedHexRange = champion.data.stats.range
			const target = getDistanceUnitOfTeamWithinRangeTo(true, champion, fixedHexRange, getAttackableUnitsOfTeam(champion.opposingTeam()))
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
				hexDistanceFromSource: hexRadius as SurroundingHexRange,
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
					const validUnits = getAttackableUnitsOfTeam(champion.opposingTeam()).filter(unit => unit !== champion.target)
					const bestUnits = getBestArrayAsMax(false, validUnits, (unit) => unit.health)
					return getBestRandomAsMax(true, bestUnits, (unit) => unit.coordDistanceSquaredTo(champion)) ?? champion.target
				},
				moveSpeed: jumpMS, //TODO fixed move time
				onDestination: (elapsedMS, champion) => { //TODO verify
					champion.queueProjectileEffect(elapsedMS, spell, {
						bonuses: [SpellKey.ManaReave, [BonusKey.ManaReductionPercent, -manaReave]],
					})
				},
			})
		},
	},

	[ChampionKey.Lucian]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				idealDestination: (champion) => {
					const hexMoveDistance = 2 //NOTE hardcoded
					const dashHexes = getHexRing(champion.activeHex, hexMoveDistance)
					return getBestHexWithinRangeTo(target, champion.range(), dashHexes)
				},
				moveSpeed: 1500, //TODO experimentally determine
				onDestination: (elapsedMS, champion) => {
					const otherValidTargets = getAttackableUnitsOfTeam(champion.opposingTeam()).filter(unit => unit !== target)
					const priorityTargets = getBestSortedAsMax(false, otherValidTargets, (unit) => unit.coordDistanceSquaredTo(champion))
					priorityTargets.unshift(target)
					const shotCount = champion.getSpellVariable(spell, 'NumShots' as SpellKey)
					const missile = champion.getMissileWithSuffix('PassiveShot2')
					priorityTargets
						.slice(0, shotCount)
						.forEach((unit, targetIndex) => {
							champion.queueProjectileEffect(elapsedMS, spell, {
								startsAfterMS: targetIndex * DEFAULT_CAST_SECONDS * 1000,
								target: unit,
								missile,
								destroysOnCollision: true, //TODO verify
							})
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
					if (shield.amount != null && shield.amount > 0) {
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

	[ChampionKey.RekSai]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {
				onCollision: (elapsedMS, effect, withUnit) => {
					const healAmount = champion.getSpellCalculationResult(spell, (withUnit.hitBy.has(champion.instanceID) ? 'HealBonus' : 'Heal') as SpellKey)
					champion.gainHealth(elapsedMS, champion, healAmount, true)
				},
			})
		},
	},

	[ChampionKey.Renata]: {
		cast: (elapsedMS, spell, champion) => {
			const targetTeam = champion.opposingTeam()
			const fixedHexRange = champion.getSpellVariable(spell, 'SpellRange' as SpellKey)
			const validUnits = getAttackableUnitsOfTeam(targetTeam).filter(unit => unit.hexDistanceTo(champion) <= fixedHexRange)
			const bestHex = randomItem(getBestDensityHexes(true, validUnits, true, 1)) //TODO experimentally determine
			if (!bestHex) { return false }
			const attackSpeedReducePercent = champion.getSpellVariable(spell, 'ASReduction' as SpellKey)
			const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const damageCalculation = champion.getSpellCalculation(spell, 'DamagePerSecond' as SpellKey)!
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: bestHex,
				fixedHexRange,
				destroysOnCollision: false,
				onCollision: (elapsedMS, effect, withUnit) => {
					withUnit.setBonusesFor(spell.name as SpellKey, [BonusKey.AttackSpeed, -attackSpeedReducePercent, elapsedMS + durationSeconds * 1000])
					withUnit.bleeds.add({
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

	[ChampionKey.Sejuani]: {
		passiveCasts: true,
		passive: (elapsedMS, spell, target, champion, damage) => { //TODO verify if basic attack physical damage is applied
			const statsSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const statsAmount = champion.getSpellVariable(spell, 'DefensiveStats' as SpellKey)
			const stunSeconds = champion.getSpellVariable(spell, 'StunDuration' as SpellKey)
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			target.applyStatusEffect(elapsedMS, StatusEffectType.stunned, stunSeconds * 1000)
			if (damageCalculation) {
				target.damage(elapsedMS, false, champion, DamageSourceType.spell, damageCalculation, false)
			}
			const expiresAtMS = elapsedMS + statsSeconds * 1000
			champion.addBonuses(spell!.name as SpellKey, [BonusKey.Armor, statsAmount, expiresAtMS], [BonusKey.MagicResist, statsAmount, expiresAtMS])
		},
	},

	[ChampionKey.Senna]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.target) { return false }
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: MAX_HEX_COUNT,
				hasBackingVisual: true,
				onCollision: (elapsedMS, effect, withUnit, damage) => {
					if (damage == null) { return }
					const lowestHPAlly = getBestRandomAsMax(false, champion.alliedUnits(true), (unit) => unit.health)
					if (lowestHPAlly) {
						const percentHealing = champion.getSpellCalculationResult(spell, 'PercentHealing' as SpellKey)
						lowestHPAlly.gainHealth(elapsedMS, champion, damage!.takingDamage * percentHealing / 100, true)
					}
				},
			})
		},
	},

	[ChampionKey.Silco]: {
		cast: (elapsedMS, spell, champion) => {
			const bonusLabelKey = spell.name as BonusLabelKey
			const numTargets = champion.getSpellVariable(spell, 'NumTargets' as SpellKey)
			const validTargets = champion.alliedUnits(true).filter(unit => !unit.getBonusesFrom(bonusLabelKey).length)
			const lowestHPAllies = getBestSortedAsMax(false, validTargets, (unit) => unit.health) //TODO can self-target?
				.slice(0, numTargets)
			if (!lowestHPAllies.length) {
				return false
			}
			const durationMS = champion.getSpellVariable(spell, SpellKey.Duration) * 1000
			const maxHealthProportion = champion.getSpellVariable(spell, 'MaxHealth' as SpellKey)
			const missile = champion.getMissileWithSuffix('R_Mis')
			lowestHPAllies.forEach(target => {
				champion.queueProjectileEffect(elapsedMS, spell, {
					target,
					targetTeam: champion.team,
					missile,
					onCollision: (elapsedMS, effect, withUnit) => {
						const attackSpeedProportion = champion.getSpellVariable(spell, SpellKey.AttackSpeed)
						withUnit.setBonusesFor(bonusLabelKey, [BonusKey.AttackSpeed, attackSpeedProportion * 100, elapsedMS + durationMS])
						target.applyStatusEffect(elapsedMS, StatusEffectType.ccImmune, durationMS)
						const healthIncrease = target.healthMax * maxHealthProportion
						target.healthMax += healthIncrease
						target.health += healthIncrease

						target.queueHexEffect(elapsedMS, undefined, {
							startsAfterMS: durationMS,
							hexDistanceFromSource: 2 * (champion.starLevel === 3 ? 2 : 1) as SurroundingHexRange,
							damageCalculation: champion.getSpellCalculation(spell, SpellKey.Damage),
							onActivate: (elapsedMS, target) => {
								target.die(elapsedMS, undefined)
							},
						})
					},
				})
			})
			return true
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
			champion.setBonusesFor(spell.name as SpellKey, [BonusKey.AttackSpeed, attackSpeedProportion, expiresAtMS])
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
			const densestEnemyHexes = getBestDensityHexes(true, getInteractableUnitsOfTeam(champion.opposingTeam()), true, 1)
			const farthestDenseHex = getDistanceHex(true, champion, densestEnemyHexes)
			if (!farthestDenseHex) { console.log('ERR', champion.name, spell.name, densestEnemyHexes) }
			const projectedHex = champion.projectHexFromHex(farthestDenseHex ?? champion.activeHex, true, 1)
			if (!projectedHex) { console.log('ERR', champion.name, spell.name, farthestDenseHex) }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS),
				expiresAfterMS: 0.5 * 1000, //TODO calculate
				onActivate: (elapsedMS, champion) => {
					champion.customMoveTo(projectedHex ?? champion, false, 2000, false) //TODO experimentally determine
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

	[ChampionKey.Vi]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target || !champion.wasInRangeOfTarget) { return false }
			const castVariation = champion.castCount % 3
			const moveMissile = champion.getMissileWithSuffix('EFx')
			const moveSpeed = moveMissile?.speedInitial
			const shieldAmount = champion.getSpellCalculationResult(spell, 'Shield' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'ShieldDuration' as SpellKey)
			const shield: ShieldData = {
				id: ChampionKey.Vi,
				amount: shieldAmount,
				expiresAfterMS: shieldSeconds * 1000,
			}
			if (castVariation < 2) {
				champion.queueShapeEffect(elapsedMS, spell, {
					shape: new ShapeEffectCone(champion, false, target, HEX_MOVE_LEAGUEUNITS * 3, toRadians(60)), //TODO experimentally determine
					onActivate: (elapsedMS, champion) => {
						champion.queueShield(elapsedMS, champion, shield)
					},
				})
				if (castVariation === 1) {
					champion.queueMoveUnitEffect(elapsedMS, spell, {
						target: champion,
						idealDestination: () => champion.projectHexFrom(target, true, 1),
						moveSpeed,
					})
				}
			} else {
				const hexRadius = champion.getSpellVariable(spell, 'AoEHexRadius' as SpellKey)
				const thirdCastSpell = champion.getSpellWithSuffix('_Spell_ThirdCast')
				champion.queueMoveUnitEffect(elapsedMS, thirdCastSpell, {
					target,
					movesWithTarget: true,
					idealDestination: () => champion.projectHexFrom(target, true, 1),
					moveSpeed,
					hexEffect: {
						hexDistanceFromSource: hexRadius as SurroundingHexRange,
						damageCalculation: champion.getSpellCalculation(spell, 'DamageFinal' as SpellKey),
					},
					onActivate: (elapsedMS, champion) => {
						champion.queueShield(elapsedMS, champion, shield)
					},
				})
			}
			return true
		},
	},

	[ChampionKey.Zeri]: {
		customAuto: (elapsedMS, spell, target, champion, empoweredAuto, windupMS) => {
			if (empoweredAuto.damageCalculation != null || empoweredAuto.destroysOnCollision != null || empoweredAuto.stackingDamageModifier != null || empoweredAuto.missile != null || empoweredAuto.hexEffect != null) {
				console.warn('empoweredAuto cannot modify', empoweredAuto)
			}
			const bulletCount = champion.getSpellVariable(spell, 'NumBullets' as SpellKey)
			const missile = champion.getMissileWithSuffix('QMis')
			const fixedHexRange = champion.range()
			const radiansBetween = Math.PI / 128 //TODO experimentally determine
			const isEmpowered = champion.statusEffects.empowered.active

			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			const bonusCalculations = empoweredAuto.bonusCalculations ?? []
			const onHitBonus = champion.getSpellCalculation(spell, 'BonusOnHit' as SpellKey)
			if (onHitBonus) { bonusCalculations.push(onHitBonus) }

			getProjectileSpread(bulletCount, radiansBetween).forEach((changeRadians, bulletIndex) => {
				champion.queueProjectileEffect(elapsedMS, undefined, {
					target: target.activeHex,
					startsAfterMS: windupMS,
					damageSourceType: DamageSourceType.attack,
					missile,
					destroysOnCollision: !isEmpowered,
					changeRadians,
					fixedHexRange,
					damageCalculation,
					bonusCalculations,
					damageModifier: empoweredAuto.damageModifier,
					statusEffects: empoweredAuto.statusEffects,
					bounce: empoweredAuto.bounce,
					bonuses: empoweredAuto.bonuses,
					opacity: 1 / 3,
					onActivate: (elapsedMS, champion) => {
						if (bulletIndex === 0) {
							champion.queueMoveUnitEffect(elapsedMS, undefined, {
								target: champion,
								idealDestination: () => getDistanceHex(true, target, getHexesSurroundingWithin(champion.activeHex, 2, false)), //TODO experimentally determine
								moveSpeed: 2000, //TODO experimentally determine
								keepsTarget: true,
							})
						}
					},
					onCollision(elapsedMS, effect, withUnit, damage) {
						if (bulletIndex === 0) {
							champion.completeAutoAttack(elapsedMS, effect, withUnit, damage, empoweredAuto, true)
						}
					},
				})
			})
		},
		cast: (elapsedMS, spell, champion) => {
			const castSeconds = 1 //TODO experimentally determine
			delayUntil(elapsedMS, castSeconds).then(elapsedMS => {
				const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
				// const vip = champion.getSpellVariable(spell, 'VIPTotalDuration' as SpellKey) //TODO VIP
				champion.applyStatusEffect(elapsedMS, StatusEffectType.empowered, durationSeconds * 1000)
			})
			champion.performActionUntilMS = elapsedMS + castSeconds * 1000
			return true
		},
	},

} as ChampionEffects

function ireliaResetRecursive(spell: ChampionSpellData, champion: ChampionUnit, moveSpeed: number, target: ChampionUnit) {
	champion.customMoveTo(target, false, moveSpeed, false, (elapsedMS, champion) => {
		if (target.isAttackable()) {
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			if (damageCalculation) {
				target.damage(elapsedMS, true, champion, DamageSourceType.spell, damageCalculation, false)
				if (target.dead) {
					const newTarget = getBestRandomAsMax(false, getAttackableUnitsOfTeam(target.team), (unit) => unit.health)
					if (newTarget) {
						return ireliaResetRecursive(spell, champion, moveSpeed, newTarget)
					}
				}
			}
		}
		champion.customMoveTo(target, true, moveSpeed, false, (elapsedMS, champion) => {
			champion.manaLockUntilMS = 0
		})
	})
	return true
}

function addDravenAxe(elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, champion: ChampionUnit) {
	const id = ChampionKey.Draven
	const existingAxe = Array.from(champion.empoweredAutos).find(empoweredAuto => empoweredAuto.id === id)
	const returnMissile = champion.getSpellWithSuffix('SpinningReturn')?.missile
	const durationSeconds = champion.getSpellVariable(spell, 'BuffDuration' as SpellKey)
	const expiresAtMS = elapsedMS + durationSeconds * 1000
	if (existingAxe) {
		if (existingAxe.amount < 2) { //NOTE hardcoded
			existingAxe.amount += 1
		}
		existingAxe.expiresAtMS = expiresAtMS //TODO the axes should technically expire individually
	} else {
		champion.empoweredAutos.add({
			id,
			amount: 1,
			expiresAtMS,
			returnMissile, //TODO fixed 2s travel time
			onCollision: (elapsedMS, effect, withUnit) => {
				if (withUnit === champion && effect.intersects(champion)) {
					console.log('AXE')
					addDravenAxe(elapsedMS, spell, champion)
				}
			},
		})
	}
}
