import { BonusKey, ChampionSpellMissileData, DamageType } from '@tacticians-academy/academy-library'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

import { ShapeEffectCircle, ShapeEffectCone } from '#/game/effects/ShapeEffect'
import { delayUntil } from '#/game/loop'
import { state } from '#/game/store'

import { getMostDistanceHex, getDistanceUnit, getRowOfMostAttackable, getBestAsMax, getInteractableUnitsOfTeam, getBestSortedAsMax, modifyMissile } from '#/helpers/abilityUtils'
import { toRadians } from '#/helpers/angles'
import { getHotspotHexes, getFarthestUnitOfTeamWithinRangeFrom, getSurroundingWithin } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { HEX_MOVE_LEAGUEUNITS, HEX_PROPORTION, MAX_HEX_COUNT } from '#/helpers/constants'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { ChampionEffects } from '#/helpers/types'
import { randomItem, shuffle } from '#/helpers/utils'

export const championEffects = {

	[ChampionKey.Ahri]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.wasInRangeOfTarget) { return false }
			const missileSpell = champion.getSpellFor('OrbMissile')
			const degreesBetweenOrbs = champion.getSpellVariable(spell, 'AngleBetweenOrbs' as SpellKey)
			const radiansBetweenOrbs = toRadians(degreesBetweenOrbs)
			const damageMultiplier = champion.getSpellVariable(spell, 'MultiOrbDamage' as SpellKey) - 1
			const orbsPerCast = champion.getSpellVariable(spell, 'SpiritFireStacks' as SpellKey)
			const maxRange = champion.getSpellVariable(spell, 'HexRange' as SpellKey)
			const orbCount = champion.castCount * orbsPerCast + 1
			const orbOffsetRadians = orbCount % 2 === 0 ? radiansBetweenOrbs / 2 : 0
			for (let castIndex = 0; castIndex < orbCount; castIndex += 1) {
				champion.queueProjectileEffect(elapsedMS, spell, {
					fixedHexRange: maxRange,
					destroysOnCollision: false,
					modifiesOnMultiHit: true,
					damageModifier: {
						multiplier: damageMultiplier,
					},
					changeRadians: orbOffsetRadians + radiansBetweenOrbs * Math.ceil(castIndex / 2) * (castIndex % 2 === 0 ? 1 : -1),
					missile: missileSpell?.missile,
					returnMissile: champion.getSpellFor('OrbReturn')?.missile ?? missileSpell?.missile,
					targetDeathAction: 'continue',
				})
			}
			return true
		},
	},

	[ChampionKey.Blitzcrank]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const durationMS = stunSeconds * 1000
			const target = getDistanceUnit(false, champion)
			champion.setTarget(target)
			champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				returnMissile: spell.missile,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS }],
				],
				onCollision: (elapsedMS, affectedUnit) => {
					champion.performActionUntilMS = 0
					const adjacentHex = affectedUnit.projectHexFrom(champion, false)
					if (adjacentHex) {
						affectedUnit.moving = true
						affectedUnit.customMoveSpeed = spell.missile?.speedInitial
						affectedUnit.setActiveHex(adjacentHex) //TODO travel time
						if (!champion.checkInRangeOfTarget()) {
							champion.setTarget(null)
						}
						champion.alliedUnits(false).forEach(unit => unit.target = affectedUnit) //TODO target if in range
						champion.empoweredAutos.add({
							amount: 1,
							statusEffects: [
								[StatusEffectType.stunned, { durationMS: 1 * 1000 }], //NOTE investigate in data
							],
						})
					}
				},
			})
			// champion.performActionUntilMS = elapsedMS + durationMS
			return true
		},
	},

	[ChampionKey.Braum]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: MAX_HEX_COUNT,
				hasBackingVisual: true,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
		},
	},

	[ChampionKey.Caitlyn]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion)
			if (!target) {
				console.log('No target', champion.name, champion.team)
				return false
			}
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				destroysOnCollision: true,
				targetDeathAction: 'farthest',
			})
		},
	},

	[ChampionKey.Camille]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, target, HEX_MOVE_LEAGUEUNITS * 2, toRadians(66)),
			})
			return true
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

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.wasInRangeOfTarget) { return false }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS * 1.125),
				onCollision: (elapsedMS, affectedUnit) => {
					champion.gainHealth(elapsedMS, champion, champion.getSpellCalculationResult(spell, SpellKey.Heal)!, true)
				},
			})
		},
	},

	[ChampionKey.Ekko]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRadius = champion.getSpellVariable(spell, 'HexRadius' as SpellKey)
			const hotspotHex = randomItem(getHotspotHexes(true, state.units, null, hexRadius as any))
			if (!hotspotHex) {
				return false
			}
			const delaySeconds = champion.getSpellVariable(spell, 'FieldDelay' as SpellKey)
			const fieldSeconds = champion.getSpellVariable(spell, 'FieldDuration' as SpellKey)
			const allyASProportion = champion.getSpellVariable(spell, 'BonusAS' as SpellKey)
			const enemyASProportion = champion.getSpellVariable(spell, 'ASSlow' as SpellKey)
			const allySeconds = champion.getSpellVariable(spell, 'BuffDuration' as SpellKey)
			const enemySeconds = champion.getSpellVariable(spell, 'SlowDuration' as SpellKey)
			const startsAfterMS = delaySeconds * 1000
			const expiresAfterMS = fieldSeconds * 1000
			const shape = new ShapeEffectCircle(hotspotHex, HEX_MOVE_LEAGUEUNITS * (hexRadius + 0.2))
			champion.queueShapeEffect(elapsedMS, spell, {
				targetTeam: champion.team,
				shape,
				startsAfterMS,
				expiresAfterMS,
				opacity: 0.5,
				onCollision: (elapsedMS, affectedUnit) => {
					affectedUnit.setBonusesFor(ChampionKey.Ekko, [BonusKey.AttackSpeed, allyASProportion * 100, elapsedMS + allySeconds * 1000])
				},
			})
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape,
				startsAfterMS,
				expiresAfterMS,
				opacity: 0.5,
				onCollision: (elapsedMS, affectedUnit) => {
					affectedUnit.setBonusesFor(ChampionKey.Ekko, [BonusKey.AttackSpeed, -enemyASProportion * 100, elapsedMS + enemySeconds * 1000])
				},
			})
		},
	},
	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: true,
				onCollision: (elapsedMS, unit) => {
					const allASBoosts = champion.getBonusesFrom(SpellKey.ASBoost)
					const maxStacks = champion.getSpellVariable(spell, SpellKey.MaxStacks)
					if (allASBoosts.length < maxStacks) {
						const boostAS = champion.getSpellCalculationResult(spell, SpellKey.ASBoost)! / maxStacks
						champion.bonuses.push([SpellKey.ASBoost, [[BonusKey.AttackSpeed, boostAS]]])
					}
				},
			})
		},
	},

	[ChampionKey.Gangplank]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {})
		},
	},

	[ChampionKey.Gnar]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getFarthestUnitOfTeamWithinRangeFrom(champion, champion.opposingTeam(), state.units)
			const boulderSpell = champion.data.spells[1]
			if (!champion.castCount) {
				const rangeReduction = 2 //NOTE hardcoded
				const transformSeconds = champion.getSpellVariable(spell, 'TransformDuration' as SpellKey)
				const bonusHealth = champion.getSpellVariable(spell, 'TransformHealth' as SpellKey)
				const manaReduction = champion.getSpellVariable(spell, 'TransformManaReduc' as SpellKey)
				const expiresAt = elapsedMS + transformSeconds * 1000
				champion.health += bonusHealth
				champion.healthMax += bonusHealth
				champion.setBonusesFor(ChampionKey.Gnar, [BonusKey.ManaReduction, manaReduction, expiresAt], [BonusKey.HexRangeIncrease, -rangeReduction, expiresAt])
				if (target) {
					const jumpToHex = champion.projectHexFrom(target, false)
					if (jumpToHex) {
						champion.moving = true
						champion.customMoveSpeed = 1000 //TODO travel time
						champion.setActiveHex(jumpToHex)
					}
				}
			}
			if (!target) { //TODO
				return true
			}
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				missile: boulderSpell.missile,
				destroysOnCollision: false,
			})
		},
	},

	[ChampionKey.Kassadin]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {
				onCollision: (elapsedMS, affectedUnit) => {
					const manaReave = champion.getSpellVariable(spell, SpellKey.ManaReave)
					const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
					const damageReduction = champion.getSpellVariable(spell, SpellKey.DamageReduction)
					affectedUnit.setBonusesFor(SpellKey.ManaReave, [BonusKey.ManaReductionPercent, manaReave * -100])
					champion.setBonusesFor(SpellKey.DamageReduction, [BonusKey.DamageReduction, damageReduction / 100, elapsedMS + durationSeconds * 1000])
				},
			})
		},
	},

	[ChampionKey.Lulu]: {
		cast: (elapsedMS, spell, champion) => {
			const alliesByLowestHP = getBestSortedAsMax(false, champion.alliedUnits(true), (unit) => unit.health)
			const allyCount = champion.getSpellVariable(spell, 'NumAllies' as SpellKey)
			const stunSeconds = champion.getSpellVariable(spell, 'CCDuration' as SpellKey)
			const healAmount = champion.getSpellVariable(spell, 'BonusHealth' as SpellKey)
			alliesByLowestHP
				.slice(0, allyCount)
				.forEach(unit => {
					if (!unit.getBonusesFrom(ChampionKey.Lulu).length) {
						champion.queueHexEffect(elapsedMS, spell, {
							hexSource: unit,
							hexDistanceFromSource: 1,
							statusEffects: [
								[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
							],
						})
					}
					unit.gainHealth(elapsedMS, champion, healAmount, true)
					unit.addBonuses(ChampionKey.Lulu)
				})
			return true
		},
	},

	[ChampionKey.MissFortune]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.target) { return false }
			const damageCalculation = champion.getSpellCalculation(spell, 'MagicDamage' as SpellKey)
			const grievousWoundsSeconds = champion.getSpellVariable(spell, 'HealingReductionDuration' as SpellKey)
			const grievousWoundsPercent = champion.getSpellVariable(spell, 'HealingReduction' as SpellKey)
			const wavesCount = 4 //NOTE hardcoded
			const hexRadius = 2 //TODO experimentally determine
			const castMS = 1000
			const msBetweenAttacks = castMS / wavesCount
			for (let waveIndex = 0; waveIndex < wavesCount; waveIndex += 1) {
				champion.queueShapeEffect(elapsedMS, spell, {
					startsAfterMS: waveIndex * msBetweenAttacks,
					shape: new ShapeEffectCircle(champion.target.activeHex, HEX_MOVE_LEAGUEUNITS * hexRadius),
					damageCalculation,
					damageModifier: {
						multiplier: -(1 - 1 / wavesCount),
					},
					statusEffects: [
						[StatusEffectType.grievousWounds, { amount: grievousWoundsPercent / 100, durationMS: grievousWoundsSeconds * 1000 }],
					],
				})
			}
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

	[ChampionKey.Orianna]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRange = 2 //NOTE hardcoded
			const hotspotHex = randomItem(getHotspotHexes(true, state.units, null, hexRange))
			if (!hotspotHex) {
				return false
			}
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const shieldAmount = champion.getSpellCalculationResult(spell, 'ShieldAmount' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'Duration' as SpellKey)
			const hexes = getSurroundingWithin(hotspotHex, hexRange, true)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
			champion.queueHexEffect(elapsedMS, spell, {
				targetTeam: champion.team,
				hexes,
				onCollision: (elapsedMS, unit) => {
					unit.queueShield(elapsedMS, champion, {
						amount: shieldAmount,
						expiresAfterMS: shieldSeconds * 1000,
					})
				},
			})
			return true
		},
	},

	[ChampionKey.Poppy]: {
		passive: (elapsedMS, spell, target, champion) => {
			const mostDistantEnemy = getDistanceUnit(false, champion, champion.opposingTeam())
			if (!mostDistantEnemy) { return false }
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: mostDistantEnemy,
				returnMissile: spell.missile,
				onCollision: (elapsedMS, affectedUnit) => {
					if (affectedUnit === champion) {
						const shieldAmount = champion.getSpellCalculationResult(spell, 'Shield' as SpellKey)
						champion.queueShield(elapsedMS, champion, {
							amount: shieldAmount,
						})
					}
				},
			})
		},
	},

	[ChampionKey.Quinn]: {
		cast: (elapsedMS, spell, champion) => {
			const highestASEnemy = getBestAsMax(true, getInteractableUnitsOfTeam(champion.opposingTeam()), (unit) => unit.attackSpeed())
			const disarmSeconds = champion.getSpellVariable(spell, 'DisarmDuration' as SpellKey)
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: highestASEnemy,
				hexEffect: {
					hexDistanceFromSource: 1,
					statusEffects: [
						[StatusEffectType.disarm, { durationMS: disarmSeconds * 1000 }],
					],
				},
			})
		},
	},

	[ChampionKey.Renata]: {
		cast: (elapsedMS, spell, champion) => {
			const targetTeam = champion.opposingTeam()
			const fixedHexRange = champion.getSpellVariable(spell, 'SpellRange' as SpellKey)
			const validUnits = getInteractableUnitsOfTeam(targetTeam).filter(unit => unit.hexDistanceTo(champion) <= fixedHexRange)
			const bestHex = randomItem(getHotspotHexes(true, validUnits, targetTeam, 1)) //TODO experimentally determine
			if (!bestHex) {
				return false
			}
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

	[ChampionKey.Seraphine]: {
		cast: (elapsedMS, spell, champion) => {
			const densestEnemyHex = randomItem(getHotspotHexes(true, state.units, null, 1)) //TODO experimentally determine
			if (!densestEnemyHex) { return false }

			const bonusASProportion = champion.getSpellVariable(spell, 'ASBonus' as SpellKey)
			const bonusSeconds = champion.getSpellVariable(spell, 'ASBonusDuration' as SpellKey)
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: densestEnemyHex,
				targetTeam: champion.team,
				fixedHexRange: MAX_HEX_COUNT,
				destroysOnCollision: false,
				opacity: 0.5,
				onCollision: (elapsedMS, affectedUnit) => {
					const healAmount = champion.getSpellCalculationResult(spell, SpellKey.Heal)
					affectedUnit.gainHealth(elapsedMS, champion, healAmount, true)
					affectedUnit.setBonusesFor(ChampionKey.Seraphine, [BonusKey.AttackSpeed, bonusASProportion * 100, elapsedMS + bonusSeconds * 1000])
				},
			})
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: densestEnemyHex,
				fixedHexRange: MAX_HEX_COUNT,
				destroysOnCollision: false,
				opacity: 0.5,
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

	[ChampionKey.Swain]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false } //TODO detaches from caster to reach?
			const arcRadians = toRadians(45) //TODO experimentally determine
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, target, HEX_MOVE_LEAGUEUNITS * 2, arcRadians),
				onCollision: (elapsedMS, unit) => {
					const heal = champion.getSpellCalculationResult(spell, 'Healing' as SpellKey)
					champion.gainHealth(elapsedMS, champion, heal, true)
				},
			})
		},
	},

	[ChampionKey.Tryndamere]: {
		cast: (elapsedMS, spell, champion) => {
			const densestEnemyHexes = getHotspotHexes(true, state.units, champion.opposingTeam(), 1)
			const farthestDenseHex = getMostDistanceHex(false, champion, densestEnemyHexes)
			if (!farthestDenseHex) { console.log('ERR', champion.name, spell.name, densestEnemyHexes) }
			const projectedHex = champion.projectHexFromHex(farthestDenseHex ?? champion.activeHex, true)
			if (!projectedHex) { console.log('ERR', champion.name, spell.name, farthestDenseHex) }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS),
				expiresAfterMS: 0.5 * 1000, //TODO calculate
				onActivate: (elapsedMS, champion) => {
					champion.moving = true
					champion.setActiveHex(projectedHex ?? champion.activeHex)
					champion.customMoveSpeed = 2000
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

	[ChampionKey.Twitch]: {
		cast: (elapsedMS, spell, champion) => {
			const grievousWoundsProportion = champion.getSpellVariable(spell, 'GWStrength' as SpellKey)
			const grievousWoundsSeconds = champion.getSpellVariable(spell, 'GWDuration' as SpellKey)
			const durationMS = grievousWoundsSeconds * 1000
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: MAX_HEX_COUNT,
				statusEffects: [
					[StatusEffectType.grievousWounds, { durationMS, amount: grievousWoundsProportion }],
				],
			})
		},
	},

	[ChampionKey.Veigar]: {
		cast: (elapsedMS, spell, champion) => {
			const strikeCount = champion.getSpellVariable(spell, 'NumStrikes' as SpellKey)
			const enemies = getInteractableUnitsOfTeam(champion.opposingTeam())
			shuffle(enemies)
			const castSeconds = 3 //TODO experimentally determine
			const secondsBetweenCasts = castSeconds / strikeCount
			for (let strikeIndex = 0; strikeIndex < strikeCount; strikeIndex += 1) {
				const enemy = enemies[strikeIndex % enemies.length]
				delayUntil(elapsedMS, strikeIndex * secondsBetweenCasts).then(elapsedMS => {
					champion.queueHexEffect(elapsedMS, spell, {
						startsAfterMS: secondsBetweenCasts,
						hexes: [[...enemy.activeHex]],
					})
				})
			}
			return true
		},
	},

	[ChampionKey.Vex]: {
		cast: (elapsedMS, spell, champion) => {
			const shieldKey = 'VexShieldMultiplier' as BonusKey
			const shieldAmount = champion.getSpellVariable(spell, 'ShieldAmount' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'ShieldDuration' as SpellKey)
			const shieldAmp = champion.getSpellVariable(spell, 'ShieldAmp' as SpellKey)
			const shieldTotalAmp = champion.getBonuses(shieldKey)
			champion.queueShield(elapsedMS, champion, {
				amount: shieldAmount * (1 + shieldTotalAmp),
				expiresAfterMS: shieldSeconds * 1000,
				onRemoved: (elapsedMS, shield) => {
					champion.manaLockUntilMS = 0
					const hexDistanceFromSource = champion.data.stats.range
					champion.queueHexEffect(elapsedMS, spell, {
						hexDistanceFromSource,
					})
					if (shield.amount <= 0) {
						champion.addBonuses(ChampionKey.Vex, [shieldKey, shieldAmp])
					} else {
						champion.queueHexEffect(elapsedMS, undefined, {
							hexDistanceFromSource,
							damageCalculation: champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey),
						})
					}
				},
			})
			champion.manaLockUntilMS = 60 * 1000
			return true
		},
	},

	[ChampionKey.Warwick]: {
		passive: (elapsedMS, spell, target, source) => {
			if (!target) {
				return true
			}
			const heal = source.getSpellCalculationResult(spell, SpellKey.HealAmount)
			const percentHealthDamage = source.getSpellCalculationResult(spell, SpellKey.PercentHealth) / 100
			const damageCalculation = createDamageCalculation(SpellKey.PercentHealth, percentHealthDamage, DamageType.magic, BonusKey.CurrentHealth, true, 1)
			target.damage(elapsedMS, false, source, DamageSourceType.attack, damageCalculation, false)
			source.gainHealth(elapsedMS, source, heal, true)
			return true
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetHex = champion.target?.activeHex
			if (!targetHex) {
				console.log('No target', champion.name, champion.team)
				return false
			}
			const centerHexes = [targetHex]
			const outerHexes = getSurroundingWithin(targetHex, 1, false)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: centerHexes,
			})
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: outerHexes,
				damageModifier: {
					multiplier: -0.5,
				},
				opacity: 0.5,
			})
			return true
		},
	},

	[ChampionKey.Zilean]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const slowProportion = champion.getSpellVariable(spell, 'Slow' as SpellKey)
			const slowSeconds = champion.getSpellVariable(spell, 'SlowDuration' as SpellKey)
			const missile = modifyMissile(spell, { width: 30 })
			const durationMS = stunSeconds * 1000
			return champion.queueProjectileEffect(elapsedMS, spell, {
				missile,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS }],
				],
				delayAfterReachingTargetMS: durationMS,
				onCollision: (elapsedMS, unit, damage) => {
					if (damage == null) {
						champion.queueHexEffect(elapsedMS, undefined, {
							damageCalculation: champion.getSpellCalculation(spell, SpellKey.Damage),
							hexSource: unit,
							hexDistanceFromSource: 1,
							statusEffects: [
								[StatusEffectType.attackSpeedSlow, { amount: slowProportion, durationMS: slowSeconds * 1000 }],
							],
						})
					}
				},
			})
		},
	},

	[ChampionKey.Zyra]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			return champion.queueHexEffect(elapsedMS, spell, {
				hexes: getRowOfMostAttackable(champion.opposingTeam()),
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
		},
	},

} as ChampionEffects
