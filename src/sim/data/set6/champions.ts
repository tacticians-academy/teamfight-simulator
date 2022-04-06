import { BonusKey, ChampionKey, DamageType } from '@tacticians-academy/academy-library'
import type { SpellCalculation } from '@tacticians-academy/academy-library'

import { state } from '#/store/store'

import { delayUntil } from '#/sim/loop'

import type { ChampionEffects } from '#/sim/data/types'

import { ShapeEffectCircle, ShapeEffectCone } from '#/sim/effects/ShapeEffect'

import { toRadians } from '#/sim/helpers/angles'
import { getBestDensityHexes, getHexRing, getHexRow, getOccupiedHexes, getHexesSurroundingWithin, getEdgeHexes } from '#/sim/helpers/board'
import type { SurroundingHexRange } from '#/sim/helpers/board'
import { createDamageCalculation } from '#/sim/helpers/calculate'
import { DEFAULT_CAST_SECONDS, DEFAULT_MANA_LOCK_MS, HEX_MOVE_LEAGUEUNITS, MAX_HEX_COUNT } from '#/sim/helpers/constants'
import { getDistanceUnitOfTeam, getRowOfMostAttackable, getInteractableUnitsOfTeam, modifyMissile, getDistanceUnitFromUnits, getUnitsOfTeam, getAttackableUnitsOfTeam, getProjectileSpread } from '#/sim/helpers/effectUtils'
import { containsHex } from '#/sim/helpers/hexes'
import { SpellKey, StatusEffectType } from '#/sim/helpers/types'
import type { BleedData, BonusLabelKey, DamageModifier } from '#/sim/helpers/types'
import { getBestRandomAsMax, getBestSortedAsMax, randomItem, randomItems, shuffle } from '#/sim/helpers/utils'

export const baseChampionEffects = {

	[ChampionKey.Blitzcrank]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const durationMS = stunSeconds * 1000
			const target = getDistanceUnitOfTeam(true, champion, champion.opposingTeam()) //TODO Blitz pulls Blitz should swap hexes
			champion.setTarget(target)
			champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				returnMissile: spell.missile,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS }],
				],
				onCollided: (elapsedMS, effect, withUnit) => {
					if (withUnit === champion) { return }
					champion.performActionUntilMS = 0
					const adjacentHex = withUnit.projectHexFrom(champion, false, 1)
					if (adjacentHex) {
						withUnit.customMoveTo(adjacentHex, false, spell.missile?.speedInitial, false, (elapsedMS, withUnit) => {
							withUnit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, durationMS)
						})
						if (!champion.checkInRangeOfTarget()) {
							champion.setTarget(null)
						}
						champion.alliedUnits(false).forEach(unit => unit.setTarget(withUnit)) //TODO target if in range
						champion.empoweredAutos.add({
							amount: 1,
							statusEffects: [
								[StatusEffectType.stunned, { durationMS: 1 * 1000 }], //NOTE investigate in data
							],
						})
					}
				},
			})
			champion.performActionUntilMS = elapsedMS + durationMS
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
			const target = getDistanceUnitOfTeam(true, champion, champion.opposingTeam())
			if (!target) { return false }
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				destroysOnCollision: true,
				targetDeathAction: 'farthestFromSource',
			})
		},
	},

	[ChampionKey.Camille]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, true, target, HEX_MOVE_LEAGUEUNITS * 2, toRadians(66)),
			})
		},
	},

	[ChampionKey.ChoGath]: {
		cast: (elapsedMS, spell, champion) => {
			const hpOnKillProportion = champion.getSpellVariable(spell, 'BonusHealthOnKill' as SpellKey)
			return champion.queueTargetEffect(elapsedMS, spell, {
				onCollided: (elapsedMS, effect, withUnit) => {
					if (withUnit.dead) {
						champion.increaseMaxHealthBy(champion.healthMax * hpOnKillProportion) //TODO UI to set base stacks
					}
				},
			})
		},
	},

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			if (!champion.wasInRangeOfTarget) { return false }
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS * 1.125),
				onCollided: (elapsedMS, effect, withUnit) => {
					champion.gainHealth(elapsedMS, champion, champion.getSpellCalculationResult(spell, SpellKey.Heal)!, true)
				},
			})
		},
	},

	[ChampionKey.Ekko]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRadius = champion.getSpellVariable(spell, 'HexRadius' as SpellKey)
			const hotspotHex = randomItem(getBestDensityHexes(true, getInteractableUnitsOfTeam(null), true, hexRadius as SurroundingHexRange))
			if (!hotspotHex) { return false }
			const delaySeconds = champion.getSpellVariable(spell, 'FieldDelay' as SpellKey)
			const fieldSeconds = champion.getSpellVariable(spell, 'FieldDuration' as SpellKey)
			const allyASProportion = champion.getSpellCalculationResult(spell, 'BonusAS' as SpellKey)
			const enemyASProportion = champion.getSpellVariable(spell, 'ASSlow' as SpellKey)
			const allySeconds = champion.getSpellVariable(spell, 'BuffDuration' as SpellKey)
			const enemySeconds = champion.getSpellVariable(spell, 'SlowDuration' as SpellKey)
			const startsAfterMS = delaySeconds * 1000
			const expiresAfterMS = fieldSeconds * 1000
			const shape = new ShapeEffectCircle(hotspotHex, HEX_MOVE_LEAGUEUNITS * (hexRadius + 0.2))
			const bonusLabelKey = spell.name as BonusLabelKey
			champion.queueShapeEffect(elapsedMS, spell, { //TODO projectile to shape effect
				targetTeam: champion.team,
				shape,
				startsAfterMS,
				expiresAfterMS,
				opacity: 0.5,
				onCollided: (elapsedMS, effect, withUnit) => {
					withUnit.setBonusesFor(bonusLabelKey, [BonusKey.AttackSpeed, allyASProportion * 100, elapsedMS + allySeconds * 1000])
				},
			})
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape,
				startsAfterMS,
				expiresAfterMS,
				opacity: 0.5,
				onCollided: (elapsedMS, effect, withUnit) => {
					withUnit.setBonusesFor(bonusLabelKey, [BonusKey.AttackSpeed, -enemyASProportion * 100, elapsedMS + enemySeconds * 1000])
				},
			})
		},
	},

	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: true,
				onCollided: (elapsedMS, effect, withUnit) => {
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

	[ChampionKey.Galio]: {
		passive: (elapsedMS, spell, target, champion, damage) => {
			if (damage && damage.didCrit) {
				champion.queueHexEffect(elapsedMS, undefined, {
					hexes: getHexRing(target.activeHex),
					damageCalculation: champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey),
					opacity: 0.5,
				})
			}
		},
		cast: (elapsedMS, spell, champion) => {
			const hexRadius = champion.getSpellVariable(spell, 'HexRadius' as SpellKey)
			const stunSeconds = champion.getSpellVariable(spell, 'StunDuration' as SpellKey)
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				idealDestination: (champion) => randomItem(getBestDensityHexes(true, getAttackableUnitsOfTeam(champion.opposingTeam()), true, Math.min(4, hexRadius) as SurroundingHexRange)),
				hexEffect: {
					hexDistanceFromSource: Math.min(4, hexRadius) as SurroundingHexRange,
					statusEffects: [
						[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
					],
				},
				moveSpeed: 2000, //TODO experimentally determine
				onActivate: (elapsedMS, champion) => {
					champion.applyStatusEffect(elapsedMS, StatusEffectType.invulnerable, 5000) //TODO time
				},
				onDestination: (elapsedMS, champion) => {
					champion.applyStatusEffect(elapsedMS, StatusEffectType.invulnerable, 0)
				},
			})
		},
	},

	[ChampionKey.Gangplank]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {})
		},
	},

	[ChampionKey.Illaoi]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const healingProportion = champion.getSpellVariable(spell, 'PercentHealing' as SpellKey)
			return champion.queueTargetEffect(elapsedMS, spell, {
				sourceTargets: [[champion, target]],
				onActivate: (elapsedMS, champion) => {
					const id = champion.instanceID
					target.damageCallbacks.forEach(damageCallback => {
						if (damageCallback.id !== id) {
							target.damageCallbacks.delete(damageCallback)
						}
					})
					target.damageCallbacks.add({
						id,
						expiresAtMS: elapsedMS + durationSeconds * 1000,
						onDamage: (elapsedMS, target, damage) => {
							champion.gainHealth(elapsedMS, champion, damage.takingDamage * healingProportion, true)
						},
					})
				},
			})
		},
	},

	[ChampionKey.Jayce]: {
		innate: (spell, champion) => {
			champion.attackMissile = champion.transformIndex === 0 ? undefined : champion.getMissileWithSuffix('RangedAttack')
		},
		cast: (elapsedMS, spell, champion) => {
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			if (spell.variables['RangedASBoost'] != null) {
				const attackSpeedDuration = champion.getSpellVariable(spell, 'RangedASDuration' as SpellKey)
				const attackSpeedProportion = champion.getSpellCalculationResult(spell, 'RangedASBoost' as SpellKey)
				const durationMS = attackSpeedDuration * 1000
				champion.queueHexEffect(elapsedMS, spell, {
					targetTeam: champion.team,
					hexes: getHexRow(champion.activeHex[1]),
					expiresAfterMS: durationMS, //TODO verify
					onCollided: (elapsedMS, effect, withUnit) => {
						withUnit.setBonusesFor(spell.name as BonusLabelKey, [BonusKey.AttackSpeed, attackSpeedProportion, elapsedMS + durationMS])
					},
				})
				champion.manaLockUntilMS = Number.MAX_SAFE_INTEGER
				const missile = champion.getMissileWithSuffix('ShockBlastMis')
				champion.empoweredAutos.add({ //TODO verify these are attacks and not custom spell casts
					amount: 2,
					missile,
					hexEffect: {
						hexDistanceFromSource: 1,
						damageCalculation,
					},
				})
				champion.empoweredAutos.add({
					activatesAfterAmount: 2,
					amount: 1,
					missile,
					hexEffect: {
						hexDistanceFromSource: 2,
						damageCalculation,
					},
					onActivate: (elapsedMS, champion) => {
						champion.manaLockUntilMS = elapsedMS + DEFAULT_MANA_LOCK_MS
					},
				})
			} else {
				const target = champion.target
				if (!target || !champion.wasInRangeOfTarget) { return false } //TODO verify

				const hexes = getBestSortedAsMax(false, getHexRing(champion.activeHex, 1), (hex) => target.coordDistanceSquaredTo(hex))
					.slice(0, 3)
				champion.queueHexEffect(elapsedMS, spell, {
					hexes,
					onActivate: (elapsedMS, champion) => {
						const shieldSeconds = champion.getSpellVariable(spell, 'ShieldDuration' as SpellKey)
						const shieldAmount = champion.getSpellCalculationResult(spell, 'ShieldAmount' as SpellKey)
						const expiresAfterMS = shieldSeconds * 1000
						champion.applyStatusEffect(elapsedMS, StatusEffectType.unstoppable, expiresAfterMS)
						champion.queueShield(elapsedMS, champion, {
							id: champion.instanceID,
							amount: shieldAmount,
							expiresAfterMS,
						})

						champion.queueHexEffect(elapsedMS, spell, {
							hexes,
							onActivate: (elapsedMS, champion) => {
								const shredProportion = champion.getSpellVariable(spell, 'MeleeShred' as SpellKey)
								const shredSeconds = champion.getSpellVariable(spell, 'MeleeShredDuration' as SpellKey)
								const shredExpiresAtMS = elapsedMS + shredSeconds * 1000
								champion.queueMoveUnitEffect(elapsedMS, undefined, {
									target: champion,
									idealDestination: () => target.activeHex,
									ignoresDestinationCollision: true,
									moveSpeed: 1000, //TODO experimentally determine
									hexEffect: {
										damageCalculation,
										hexSource: target,
										hexDistanceFromSource: 2,
										bonuses: [spell.name as BonusLabelKey, [BonusKey.ArmorShred, shredProportion, shredExpiresAtMS], [BonusKey.MagicResistShred, shredProportion, shredExpiresAtMS]],
									},
									onDestination: (elapsedMS, champion) => {
										if (!target.dead) { //TODO check if target hex is open
											champion.customMoveTo(champion.activeHex, true, undefined, true) //TODO experimentally determine
										}
									},
								})
							},
						})
					},
				})
			}
			return true
		},
	},

	[ChampionKey.Jhin]: {
		cast: (elapsedMS, spell, champion) => {
			const falloffProportion = champion.getSpellVariable(spell, 'DamageFalloff' as SpellKey)
			const stackingDamageModifier: DamageModifier = {
				multiplier: -falloffProportion,
			}
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			const missile = champion.getMissileWithSuffix('RShotMis')
			champion.empoweredAutos.add({
				amount: 3,
				damageCalculation,
				destroysOnCollision: false,
				missile,
				stackingDamageModifier,
			})
			const fourShotCalculation: SpellCalculation | undefined = JSON.parse(JSON.stringify(damageCalculation))
			fourShotCalculation?.parts.push({ //NOTE hardcoded
				operator: 'product',
				subparts: [
					{
						stat: BonusKey.MissingHealthPercent,
						statFromTarget: true,
						ratio: 1,
					},
					{
						stat: BonusKey.AbilityPower,
						ratio: 1,
					},
				],
			})

			champion.empoweredAutos.add({
				activatesAfterAmount: 3,
				amount: 1,
				damageCalculation: fourShotCalculation,
				destroysOnCollision: false,
				damageModifier: {
					alwaysCrits: true,
				},
				missile: champion.getMissileWithSuffix('RShotMis4') ?? missile,
				stackingDamageModifier,
				onActivate: (elapsedMS, champion) => {
					champion.manaLockUntilMS = elapsedMS + DEFAULT_MANA_LOCK_MS
				},
			})
			if (spell.castTime != null) {
				champion.performActionUntilMS = elapsedMS + spell.castTime //TODO lock in place, infinite range?
			}
			champion.manaLockUntilMS = Number.MAX_SAFE_INTEGER
			return true
		},
	},

	[ChampionKey.Jinx]: {
		passive: (elapsedMS, spell, target, source, damage) => {
			if (source.castCount > 0) {
				const otherEnemies = getAttackableUnitsOfTeam(source.opposingTeam()).filter(unit => unit !== target)
				source.setTarget(randomItem(otherEnemies))
			}
		},
		cast: (elapsedMS, spell, champion) => {
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				idealDestination: (champion) => randomItem(getBestDensityHexes(true, getInteractableUnitsOfTeam(champion.opposingTeam()), true, 4)),
				moveSpeed: 1000, //TODO experimentally determine
				onDestination: (elapsedMS, champion) => {
					champion.manaLockUntilMS = Number.MAX_SAFE_INTEGER
					champion.addBonuses(spell.name as BonusLabelKey, [BonusKey.HexRangeIncrease, MAX_HEX_COUNT])

					const centerHex = champion.activeHex
					const innerRadius = champion.getSpellVariable(spell, 'InnerRadius' as SpellKey)
					const outerRadius = champion.getSpellVariable(spell, 'OuterRadius' as SpellKey)
					const damageFalloffProportion = champion.getSpellVariable(spell, 'FalloffPercent' as SpellKey)
					const innerHexes = getHexesSurroundingWithin(centerHex, innerRadius as SurroundingHexRange, false)
					const outerHexes = getHexesSurroundingWithin(centerHex, Math.min(4, outerRadius) as SurroundingHexRange, false) //TODO support 5 range
					const magicDamage = champion.getSpellVariable(spell, SpellKey.Damage, true)
					const damageCalculation = createDamageCalculation(spell.name, magicDamage, DamageType.magic, BonusKey.AbilityPower, false, 0.01)
					champion.queueHexEffect(elapsedMS, undefined, {
						hexes: innerHexes,
						damageCalculation,
						damageModifier: {
							multiplier: -damageFalloffProportion,
						},
						opacity: damageFalloffProportion,
					})
					champion.queueHexEffect(elapsedMS, undefined, {
						hexes: outerHexes,
						damageCalculation,
						damageModifier: {
							multiplier: -damageFalloffProportion,
						},
						opacity: damageFalloffProportion,
					})

					const burnHexes = getHexesSurroundingWithin(centerHex, 2, true) //NOTE Hardcoded
					const burnPercent = champion.getSpellVariable(spell, 'PercentBurn' as SpellKey)
					const burnHexSeconds = champion.getSpellVariable(spell, 'HexDuration' as SpellKey)
					const burnTickMS = 1000 //NOTE hardcoded
					champion.queueHexEffect(elapsedMS, undefined, {
						targetTeam: null,
						hexes: burnHexes,
						expiresAfterMS: burnHexSeconds * 1000,
						ticksEveryMS: burnTickMS,
						damageCalculation: createDamageCalculation(spell.name, burnPercent, DamageType.true, BonusKey.Health, true, 0.01),
					})

					champion.empoweredAutos.add({
						amount: 9001,
						hexEffect: {
							hexDistanceFromSource: 1, //NOTE hardcoded
							targetTeam: champion.opposingTeam(),
							damageCalculation: champion.getSpellCalculation(spell, SpellKey.Damage), //TODO This adds to the base attack damage for the target. Should it replace it instead?
						},
					})
				},
			})
		},
	},

	[ChampionKey.KaiSa]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target: champion,
				moveSpeed: 4000, //TODO experimentally determine
				idealDestination: (champion) => {
					const enemies = getInteractableUnitsOfTeam(champion.opposingTeam())
					const enemyColdMap = getBestDensityHexes(false, enemies, true, Math.min(4, champion.range()) as SurroundingHexRange)
					return getBestRandomAsMax(true, enemyColdMap.filter(hex => !champion.isAt(hex)), (hex) => enemies.reduce((acc, unit) => acc + unit.coordDistanceSquaredTo(hex), 0))
				},
				onDestination: (elapsedMS, champion) => {
					const attackableEnemies = getAttackableUnitsOfTeam(champion.opposingTeam())
					const missileCount = champion.getSpellVariable(spell, 'NumMissiles' as SpellKey) + champion.basicAttackCount
					const castSeconds = champion.getSpellVariable(spell, 'FakeCastTime' as SpellKey)
					getProjectileSpread(missileCount, toRadians(5)).forEach((changeRadians, index) => {
						champion.queueProjectileEffect(elapsedMS, spell, {
							startsAfterMS: (castSeconds + castSeconds * index / missileCount) * 1000,
							target: attackableEnemies[index % attackableEnemies.length],
							changeRadians, //TODO from sides with turn speed
							targetDeathAction: 'closestFromTarget',
							// missile: //TODO shoulder missile fixed travel time
						})
					})
				},
			})
		},
	},

	[ChampionKey.Kassadin]: {
		cast: (elapsedMS, spell, champion) => {
			return champion.queueProjectileEffect(elapsedMS, spell, {
				onCollided: (elapsedMS, effect, withUnit) => {
					const manaReave = champion.getSpellVariable(spell, SpellKey.ManaReave)
					const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
					const damageReduction = champion.getSpellVariable(spell, SpellKey.DamageReduction)
					withUnit.setBonusesFor(SpellKey.ManaReave, [BonusKey.ManaReductionPercent, manaReave * -100])
					champion.setBonusesFor(SpellKey.DamageReduction, [BonusKey.DamageReduction, damageReduction / 100, elapsedMS + durationSeconds * 1000])
				},
			})
		},
	},

	[ChampionKey.Leona]: {
		cast: (elapsedMS, spell, champion) => {
			const shieldAmount = champion.getSpellCalculationResult(spell, 'Shielding' as SpellKey)
			const durationSeconds = champion.getSpellVariable(spell, SpellKey.Duration)
			const bonusStats = champion.getSpellVariable(spell, 'BonusStats' as SpellKey)
			// const vip = champion.getSpellVariable(spell, 'T1DebutantBonus' as SpellKey) //TODO VIP
			const expiresAfterMS = durationSeconds * 1000
			champion.queueHexEffect(elapsedMS, spell, {
				targetTeam: champion.team,
				hexDistanceFromSource: 2, //NOTE hardcoded
				opacity: 0.5,
				onActivate: (elapsedMS, champion) => {
					champion.queueShield(elapsedMS, champion, {
						amount: shieldAmount,
						expiresAfterMS,
					})
					champion.manaLockUntilMS = elapsedMS + expiresAfterMS
				},
				onCollided: (elapsedMS, effect, withUnit) => {
					withUnit.setBonusesFor(spell.name as BonusLabelKey, [BonusKey.Armor, bonusStats, elapsedMS + expiresAfterMS], [BonusKey.MagicResist, bonusStats, elapsedMS + expiresAfterMS])
				},
			})
			return true
		},
	},

	[ChampionKey.Lulu]: {
		cast: (elapsedMS, spell, champion) => {
			const alliesByLowestHP = getBestSortedAsMax(false, champion.alliedUnits(true), (unit) => unit.health)
			const allyCount = champion.getSpellVariable(spell, 'NumAllies' as SpellKey)
			const stunSeconds = champion.getSpellVariable(spell, 'CCDuration' as SpellKey)
			const healAmount = champion.getSpellCalculationResult(spell, 'BonusHealth' as SpellKey)
			alliesByLowestHP
				.slice(0, allyCount)
				.forEach(unit => {
					const bonusLabelKey = spell.name as BonusLabelKey
					if (!unit.getBonusesFrom(bonusLabelKey).length) {
						champion.queueHexEffect(elapsedMS, spell, {
							hexSource: unit,
							hexDistanceFromSource: 1,
							statusEffects: [
								[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
							],
						})
					}
					unit.addBonuses(bonusLabelKey)
					unit.gainHealth(elapsedMS, champion, healAmount, true)
				})
			return true
		},
	},

	[ChampionKey.Malzahar]: {
		cast: (elapsedMS, spell, champion) => {
			let target = champion.target
			if (!target) { return false }
			const sourceID = ChampionKey.Malzahar
			if (target.getBleed(sourceID)) {
				const unafflictedEnemies = getAttackableUnitsOfTeam(target.team).filter(unit => !unit.getBleed(sourceID))
				const newTarget = getDistanceUnitFromUnits(false, target, unafflictedEnemies)
				if (newTarget) {
					target = newTarget
				}
			}
			const mrShredProportion = champion.getSpellVariable(spell, 'MRShred' as SpellKey)
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)!
			const durationMS = champion.getSpellVariable(spell, SpellKey.Duration) * 1000
			const repeatsEveryMS = champion.getSpellVariable(spell, 'TickRate' as SpellKey) * 1000
			const iterationCount = durationMS / repeatsEveryMS
			const bleed: BleedData = {
				sourceID,
				source: champion,
				activatesAtMS: elapsedMS,
				damageCalculation,
				damageModifier: {
					multiplier: -(1 - 1 / iterationCount),
				},
				repeatsEveryMS,
				remainingIterations: iterationCount,
				onDeath: (elapsedMS, oldTarget) => {
					const spreadCount = champion.getSpellVariable(spell, 'SpreadTargets' as SpellKey)
					getBestSortedAsMax(false, getInteractableUnitsOfTeam(oldTarget.team), (unit) => unit.coordDistanceSquaredTo(oldTarget) + (unit.getBleed(sourceID) ? 1 : 0)) //TODO attackable only?
						.slice(0, spreadCount)
						.forEach(newTarget => {
							newTarget.addBleedIfStrongerThan(sourceID, bleed)
						})
				},
			}
			target.addBleedIfStrongerThan(sourceID, bleed)
			target.setBonusesFor(spell.name as BonusLabelKey, [BonusKey.MagicResistShred, mrShredProportion, elapsedMS + durationMS])
			return true
		},
	},

	[ChampionKey.MalzaharVoidling]: {
		cast: (elapsedMS, spell, champion) => {
			delayUntil(elapsedMS, spell.castTime ?? DEFAULT_CAST_SECONDS).then(elapsedMS => {
				const shieldSeconds = champion.getSpellVariable(spell, 'DamageReducedDuration' as SpellKey)
				const damageReductionProportion = champion.getSpellVariable(spell, 'DamageReducedPercent' as SpellKey)
				const shieldDamageCalculation = champion.getSpellCalculation(spell, 'DamageAmount' as SpellKey)

				const shielding = [champion]
				const enemies = getUnitsOfTeam(champion.opposingTeam())
				const mostTargetedAlly = getBestRandomAsMax(true, champion.alliedUnits(false), (unit) => enemies.filter(enemy => enemy.target === unit).length)
				if (mostTargetedAlly) { shielding.push(mostTargetedAlly) }

				shielding.forEach(unit => {
					unit.queueShield(elapsedMS, champion, {
						id: champion.name,
						type: 'barrier',
						damageReduction: damageReductionProportion,
						expiresAfterMS: shieldSeconds * 1000,
						bonusDamage: shieldDamageCalculation,
					})
				})
			})
			return true
		},
	},
	[ChampionKey.Tibbers]: {
		passiveCasts: true,
		passive: (elapsedMS, spell, target, champion, damage) => {
			delayUntil(elapsedMS, spell?.castTime ?? DEFAULT_CAST_SECONDS).then(elapsedMS => {
				const buffSeconds = champion.getSpellCalculationResult(spell, 'BuffDuration' as SpellKey)
				const bonusADProportion = champion.getSpellVariable(spell, 'PercentAD' as SpellKey)
				const allyADAP = champion.getSpellVariable(spell, 'AllyADAPBuff' as SpellKey)
				const expiresAtMS = elapsedMS + buffSeconds * 1000
				const bonusKey = spell!.name as BonusLabelKey
				champion.setBonusesFor(bonusKey, [BonusKey.AttackDamage, champion.attackDamage() * bonusADProportion, expiresAtMS])
				champion
					.alliedUnits(false)
					.forEach(unit => unit.setBonusesFor(bonusKey, [BonusKey.AttackDamage, allyADAP, expiresAtMS], [BonusKey.AbilityPower, allyADAP, expiresAtMS]))
			})
		},
	},
	[ChampionKey.HexTechDragon]: {
		innate: (spell, champion) => {
			const damageCalculation = champion.getSpellCalculation(spell, 'BonusLightningDamage' as SpellKey)
			const chainCount = champion.getSpellVariable(spell, 'NumEnemies' as SpellKey)
			champion.statusEffects.ccImmune.active = true
			champion.statusEffects.ccImmune.expiresAtMS = Number.MAX_SAFE_INTEGER
			champion.empoweredAutos.add({
				amount: 9001,
				nthAuto: 3, //NOTE hardcoded
				bounce: {
					bouncesRemaining: chainCount, //TODO applies to first target as bonus
					damageCalculation,
				},
				missile: champion.data.spells[1]?.missile,
			})
		},
		cast: (elapsedMS, spell, champion) => {
			const fearHexRange = champion.getSpellVariable(spell, 'FearHexRange' as SpellKey)
			const fearSeconds = champion.getSpellVariable(spell, 'FearDuration' as SpellKey)
			return champion.queueHexEffect(elapsedMS, spell, {
				targetTeam: champion.opposingTeam(),
				hexDistanceFromSource: Math.min(4, fearHexRange) as SurroundingHexRange, //TODO support 5 hex range
				onCollided: (elapsedMS, effect, withUnit) => {
					const occupiedHexes = getOccupiedHexes(state.units.filter(unit => unit !== withUnit))
					champion.queueMoveUnitEffect(elapsedMS, undefined, {
						target: withUnit,
						idealDestination: (target) => getBestRandomAsMax(true, getHexesSurroundingWithin(target.activeHex, 1, true), (hex) => (containsHex(hex, occupiedHexes) ? undefined : champion.coordDistanceSquaredTo(hex))),
						ignoresDestinationCollision: true,
						moveSpeed: HEX_MOVE_LEAGUEUNITS / 2, //TODO fixed fearSeconds duration
					})
					withUnit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, fearSeconds * 1000)
				},
				onActivate: (elapsedMS, champion) => {
					const energizedSeconds = champion.getSpellVariable(spell, 'EnergizedDuration' as SpellKey)
					const expiresAtMS = elapsedMS + energizedSeconds * 1000
					champion.alliedUnits(true).forEach(alliedUnit => {
						alliedUnit.empoweredAutos.add({
							amount: 9001,
							expiresAtMS,
							damageModifier: {
								alwaysCrits: true,
							},
						})
					})
				},
			})
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

	[ChampionKey.Orianna]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRange = 2 //NOTE hardcoded
			const hotspotHex = randomItem(getBestDensityHexes(true, getInteractableUnitsOfTeam(null), true, hexRange))
			if (!hotspotHex) { return false }
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const shieldAmount = champion.getSpellCalculationResult(spell, 'ShieldAmount' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'Duration' as SpellKey)
			const hexes = getHexesSurroundingWithin(hotspotHex, hexRange, true)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
			champion.queueHexEffect(elapsedMS, spell, {
				targetTeam: champion.team,
				hexes,
				onCollided: (elapsedMS, effect, withUnit) => {
					withUnit.queueShield(elapsedMS, champion, {
						amount: shieldAmount,
						expiresAfterMS: shieldSeconds * 1000,
					})
				},
			})
			return true
		},
	},

	[ChampionKey.Poppy]: {
		passiveCasts: true,
		passive: (elapsedMS, spell, target, champion, damage) => {
			const mostDistantEnemy = getDistanceUnitOfTeam(true, champion, champion.opposingTeam())
			if (!mostDistantEnemy) { return false }
			return champion.queueProjectileEffect(elapsedMS, spell, {
				target: mostDistantEnemy,
				returnMissile: spell!.missile,
				onCollided: (elapsedMS, effect, withUnit) => {
					if (withUnit !== champion) { return }
					const shieldAmount = champion.getSpellCalculationResult(spell, 'Shield' as SpellKey)
					champion.queueShield(elapsedMS, champion, {
						id: ChampionKey.Poppy,
						amount: shieldAmount,
					})
				},
			})
		},
	},

	[ChampionKey.Quinn]: {
		cast: (elapsedMS, spell, champion) => {
			const highestASEnemy = getBestRandomAsMax(true, getAttackableUnitsOfTeam(champion.opposingTeam()), (unit) => unit.attackSpeed())
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

	[ChampionKey.Seraphine]: {
		cast: (elapsedMS, spell, champion) => {
			const densestEnemyHex = randomItem(getBestDensityHexes(true, getInteractableUnitsOfTeam(null), true, 1)) //TODO experimentally determine
			if (!densestEnemyHex) { return false }
			const bonusASProportion = champion.getSpellVariable(spell, 'ASBonus' as SpellKey)
			const bonusSeconds = champion.getSpellVariable(spell, 'ASBonusDuration' as SpellKey)
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: densestEnemyHex,
				targetTeam: champion.team,
				fixedHexRange: MAX_HEX_COUNT,
				destroysOnCollision: false,
				opacity: 0.5,
				onCollided: (elapsedMS, effect, withUnit) => {
					const healAmount = champion.getSpellCalculationResult(spell, SpellKey.Heal)
					withUnit.gainHealth(elapsedMS, champion, healAmount, true)
					withUnit.setBonusesFor(spell.name as BonusLabelKey, [BonusKey.AttackSpeed, bonusASProportion * 100, elapsedMS + bonusSeconds * 1000])
				},
			})
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: densestEnemyHex,
				fixedHexRange: MAX_HEX_COUNT,
				destroysOnCollision: false,
				opacity: 0.5,
			})
			return true
		},
	},

	[ChampionKey.Singed]: {
		cast: (elapsedMS, spell, champion) => {
			const targetStunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const aoeStunSeconds = champion.getSpellVariable(spell, 'AoEStunDuration' as SpellKey)
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				moveSpeed: 1000, //TODO experimentally determine
				idealDestination: (target) => randomItem(getBestDensityHexes(true, getInteractableUnitsOfTeam(target.team).filter(unit => unit !== target), false, 2)),
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: targetStunSeconds * 1000 }],
				],
				hexEffect: {
					hexDistanceFromSource: 1,
					statusEffects: [
						[StatusEffectType.stunned, { durationMS: aoeStunSeconds * 1000 }],
					],
				},
			})
		},
	},

	[ChampionKey.Swain]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false } //TODO detaches from caster to reach?
			const arcRadians = toRadians(45) //TODO experimentally determine
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, false, target, HEX_MOVE_LEAGUEUNITS * 2, arcRadians),
				onCollided: (elapsedMS, effect, withUnit) => {
					const heal = champion.getSpellCalculationResult(spell, 'Healing' as SpellKey)
					champion.gainHealth(elapsedMS, champion, heal, true)
				},
			})
		},
	},

	[ChampionKey.Syndra]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnitOfTeam(false, champion, champion.opposingTeam())
			if (!target) { return false }
			const targetStunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			// const aoeStunSeconds = champion.getSpellVariable(spell, 'VIPDebutantBonus' as SpellKey) //TODO VIP
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target,
				moveSpeed: 1000, //TODO experimentally determine
				idealDestination: (target) => getDistanceUnitOfTeam(true, champion, champion.opposingTeam())?.activeHex,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: targetStunSeconds * 1000 }],
				],
			})
		},
	},

	[ChampionKey.Talon]: {
		passive: (elapsedMS, spell, target, source, damage) => {
			const bleedSeconds = source.getSpellVariable(spell, 'BleedDuration' as SpellKey)
			// const vip = source.getSpellVariable(spell, 'VIPBleedDurationBonus' as SpellKey) //TODO VIP
			const repeatsEveryMS = 1000 //TODO experimentally determine
			const iterationsCount = bleedSeconds * 1000 / repeatsEveryMS
			const sourceID = source.instanceID
			const basicAttacksOnTarget = target.basicAttackSourceIDs.filter(basicAttackSourceID => basicAttackSourceID === sourceID).length
			if (basicAttacksOnTarget % 3 === 0) { //NOTE hardcoded
				target.bleeds.add({
					sourceID,
					source,
					damageCalculation: source.getSpellCalculation(spell, SpellKey.Damage)!,
					damageModifier: {
						multiplier: -(1 - 1 / iterationsCount),
					},
					activatesAtMS: elapsedMS,
					repeatsEveryMS,
					remainingIterations: iterationsCount,
				})
			}
			return true
		},
	},

	[ChampionKey.TahmKench]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return false }
			delayUntil(elapsedMS, spell.castTime ?? DEFAULT_CAST_SECONDS).then(elapsedMS => {
				const spellShield = target.consumeSpellShield()
				const ignoresCC = spellShield != null || target.isUnstoppable()
				const bellySeconds = champion.getSpellVariable(spell, 'BellyDuration' as SpellKey)
				const damageCalculation = ignoresCC ? champion.getSpellCalculation(spell, 'ReducedDamageToCC' as SpellKey) : champion.getSpellCalculation(spell, SpellKey.Damage)
				if (damageCalculation) {
					if (!ignoresCC) {
						target.applyStatusEffect(elapsedMS, StatusEffectType.invulnerable, bellySeconds * 1000)
						target.collides = false
					}
					const sourceID = ChampionKey.TahmKench
					const tickSeconds = champion.getSpellVariable(spell, 'TickRate' as SpellKey)
					const tickCount = bellySeconds / tickSeconds
					target.addBleedIfStrongerThan(sourceID, {
						sourceID,
						source: champion,
						damageCalculation,
						damageModifier: {
							multiplier: -(1 - 1 / tickCount),
							increase: spellShield?.amount != null ? -spellShield.amount : undefined,
							ignoresInvulnerability: true,
						},
						activatesAtMS: elapsedMS,
						repeatsEveryMS: tickSeconds * 1000,
						remainingIterations: tickCount,
					})
					delayUntil(elapsedMS, bellySeconds).then(elapsedMS => {
						target.collides = true
						if (!target.dead) {
							const farthestEnemy = getDistanceUnitOfTeam(true, champion, champion.opposingTeam())
							const impactStunSeconds = champion.getSpellVariable(spell, 'StunDuration' as SpellKey)
							champion.queueMoveUnitEffect(elapsedMS, undefined, {
								target,
								targetTeam: target.team,
								idealDestination: () => (farthestEnemy ? champion.projectHexFrom(farthestEnemy, false, 1) : champion.activeHex),
								moveSpeed: 2000, //TODO experimentally determine
								collisionSizeMultiplier: 2,
								onCollided: (elapsedMS, effect, withUnit) => {
									withUnit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, impactStunSeconds * 1000)
								},
							})
						}
					})
				}
			})
			return true
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
			const enemies = getAttackableUnitsOfTeam(champion.opposingTeam())
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

	[ChampionKey.Viktor]: {
		passive: (elapsedMS, spell, target, source, damage) => {
			const armorShredProportion = source.getSpellVariable(spell, 'ArmorReduction' as SpellKey)
			const armorShredSeconds = source.getSpellVariable(spell, 'ShredDuration' as SpellKey)
			target.applyStatusEffect(elapsedMS, StatusEffectType.armorReduction, armorShredSeconds * 1000, armorShredProportion)
		},
		cast: (elapsedMS, spell, champion) => {
			delayUntil(elapsedMS, spell.castTime!).then(elapsedMS => {
				const laserCount = champion.getSpellVariable(spell, 'NumLasers' as SpellKey)
				const droneMissile = champion.getMissileWithSuffix('EDroneMis')
				const laserMissile = champion.getMissileWithSuffix('EDamageMis')
				const droneHexes = randomItems(laserCount, getEdgeHexes()) //TODO distributed random
				champion.queueHexEffect(elapsedMS, undefined, {
					startsAfterMS: droneMissile?.travelTime,
					hexes: droneHexes,
					onActivate: (elapsedMS) => {
						const validTargets = shuffle(getAttackableUnitsOfTeam(champion.opposingTeam()))
						if (!validTargets.length) { return }
						droneHexes.forEach((droneHex, laserIndex) => {
							champion.queueProjectileEffect(elapsedMS, spell, {
								projectileStartsFrom: droneHex,
								target: validTargets[laserIndex % validTargets.length], //TODO handle same projectileStartsFrom/target hex
								missile: laserMissile,
								destroysOnCollision: false,
								fixedHexRange: MAX_HEX_COUNT,
								onModifyDamage: (elapsedMS, withUnit, damage) => {
									const shieldDestructionProportion = champion.getSpellVariable(spell, 'ShieldDestructionPercent' as SpellKey)
									withUnit.shields.forEach(shield => {
										if (shield.amount != null) {
											shield.amount *= (1 - shieldDestructionProportion)
										}
									})
								},
							})
						})
					},
				})
			})
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
			const expiresAfterMS = shieldSeconds * 1000
			champion.queueShield(elapsedMS, champion, {
				amount: shieldAmount * (1 + shieldTotalAmp),
				expiresAfterMS,
				onRemoved: (elapsedMS, shield) => {
					champion.manaLockUntilMS = 0
					const hexDistanceFromSource = champion.data.stats.range as SurroundingHexRange
					champion.queueHexEffect(elapsedMS, spell, {
						hexDistanceFromSource,
					})
					if (shield.amount != null && shield.amount > 0) {
						champion.queueHexEffect(elapsedMS, undefined, {
							hexDistanceFromSource,
							damageCalculation: champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey),
						})
					} else {
						champion.addBonuses(spell.name as BonusLabelKey, [shieldKey, shieldAmp])
					}
				},
			})
			champion.manaLockUntilMS = 60 * 1000
			return true
		},
	},

	[ChampionKey.Warwick]: {
		passive: (elapsedMS, spell, target, source, damage) => {
			const heal = source.getSpellCalculationResult(spell, SpellKey.HealAmount)
			const percentHealthDamage = source.getSpellCalculationResult(spell, SpellKey.PercentHealth) / 100
			const damageCalculation = createDamageCalculation(SpellKey.PercentHealth, percentHealthDamage, DamageType.magic, BonusKey.CurrentHealth, true, 1)
			target.takeBonusDamage(elapsedMS, source, damageCalculation, false)
			source.gainHealth(elapsedMS, source, heal, true)
			return true
		},
	},

	[ChampionKey.Zac]: {
		cast: (elapsedMS, spell, champion) => {
			const validUnits = getAttackableUnitsOfTeam(champion.opposingTeam())
				.filter(unit => unit.hexDistanceTo(champion) <= 3) //NOTE hardcoded
			const targets = getBestSortedAsMax(true, validUnits, (unit) => unit.coordDistanceSquaredTo(champion))
				.slice(0, 2)
			if (!targets.length) { return false }
			champion.queueProjectileEffect(elapsedMS, spell, { //TODO line visual style
				target: targets[0],
				onCollided: (elapsedMS, effect, withUnit) => {
					champion.queueProjectileEffect(elapsedMS, spell, {
						target: targets[1] ?? targets[0],
						onCollided: (elapsedMS, effect, withUnit) => {
							targets.forEach(target => {
								champion.queueMoveUnitEffect(elapsedMS, undefined, {
									target,
									idealDestination: (target) => champion.projectHexFrom(target, false, 2),
									moveSpeed: 600, //TODO fixed time
									onDestination: (elapsedMS, unit) => {
										champion.performActionUntilMS = 0
									},
								})
							})
						},
					})
					champion.performActionUntilMS = elapsedMS + 1000
				},
			})
			champion.performActionUntilMS = elapsedMS + 1000
			return true
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetHex = champion.target?.activeHex
			if (!targetHex) { return false }
			const centerHexes = [targetHex]
			const outerHexes = getHexesSurroundingWithin(targetHex, 1, false)
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
				onCollided: (elapsedMS, effect, withUnit, damage) => {
					if (damage == null) {
						champion.queueHexEffect(elapsedMS, undefined, {
							damageCalculation: champion.getSpellCalculation(spell, SpellKey.Damage),
							hexSource: withUnit,
							hexDistanceFromSource: 1,
							statusEffects: [
								[StatusEffectType.attackSpeedSlow, { amount: slowProportion * 100, durationMS: slowSeconds * 1000 }],
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
