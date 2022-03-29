import { BonusKey, ChampionKey, DamageType } from '@tacticians-academy/academy-library'
import type { SpellCalculation } from '@tacticians-academy/academy-library'

import { ShapeEffectCircle, ShapeEffectCone } from '#/game/effects/ShapeEffect'
import { delayUntil } from '#/game/loop'
import { state } from '#/game/store'

import { getDistanceUnit, getRowOfMostAttackable, getBestAsMax, getInteractableUnitsOfTeam, getBestSortedAsMax, modifyMissile, getDistanceUnitFromUnits } from '#/helpers/abilityUtils'
import { toRadians } from '#/helpers/angles'
import { getHotspotHexes, getSurroundingWithin } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { DEFAULT_MANA_LOCK_MS, HEX_MOVE_LEAGUEUNITS, MAX_HEX_COUNT } from '#/helpers/constants'
import { SpellKey, StatusEffectType } from '#/helpers/types'
import type { BleedData, ChampionEffects, DamageModifier } from '#/helpers/types'
import { randomItem, shuffle } from '#/helpers/utils'

export const baseChampionEffects = {

	[ChampionKey.Blitzcrank]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			const durationMS = stunSeconds * 1000
			const target = getDistanceUnit(true, champion)
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
						affectedUnit.customMoveTo(adjacentHex, false, spell.missile?.speedInitial) //TODO travel time
						if (!champion.checkInRangeOfTarget()) {
							champion.setTarget(null)
						}
						champion.alliedUnits(false).forEach(unit => unit.setTarget(affectedUnit)) //TODO target if in range
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
			const target = getDistanceUnit(true, champion)
			if (!target) { return false }
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
			return champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, target, HEX_MOVE_LEAGUEUNITS * 2, toRadians(66)),
			})
		},
	},

	[ChampionKey.ChoGath]: {
		cast: (elapsedMS, spell, champion) => {
			const hpOnKillProportion = champion.getSpellVariable(spell, 'BonusHealthOnKill' as SpellKey)
			return champion.queueTargetEffect(elapsedMS, spell, {
				onCollision: (elapsedMS, target) => {
					if (target.dead) {
						champion.increaseMaxHealthBy(champion.healthMax * hpOnKillProportion) //TODO allow setting base stacks
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
			champion.queueShapeEffect(elapsedMS, spell, { //TODO projectile
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
							champion.gainHealth(elapsedMS, champion, damage! * healingProportion, true)
						},
					})
				},
			})
		},
	},

	[ChampionKey.Jhin]: {
		cast: (elapsedMS, spell, champion) => {
			const falloffProportion = champion.getSpellVariable(spell, 'DamageFalloff' as SpellKey)
			const stackingDamageModifier: DamageModifier = {
				multiplier: -falloffProportion,
			}
			const damageCalculation = champion.getSpellCalculation(spell, SpellKey.Damage)
			const missile = champion.getMissileFor('RShotMis')
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
					//TODO guaranteed crit
				},
				missile: champion.getMissileFor('RShotMis4') ?? missile,
				stackingDamageModifier,
				onActivate: (elapsedMS, champion) => {
					champion.manaLockUntilMS = elapsedMS + DEFAULT_MANA_LOCK_MS
				},
			})
			if (spell.castTime != null) {
				champion.performActionUntilMS = elapsedMS + spell.castTime //TODO lock in place, infinite range
			}
			champion.manaLockUntilMS = Number.MAX_SAFE_INTEGER
			return true
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
				onCollision: (elapsedMS, unit) => {
					unit.setBonusesFor(champion.instanceID as ChampionKey, [BonusKey.Armor, bonusStats, elapsedMS + expiresAfterMS], [BonusKey.MagicResist, bonusStats, elapsedMS + expiresAfterMS])
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

	[ChampionKey.Malzahar]: {
		cast: (elapsedMS, spell, champion) => {
			let target = champion.target
			if (!target) { return false }
			const sourceID = ChampionKey.Malzahar
			if (target.getBleed(sourceID)) {
				const unafflictedEnemies = getInteractableUnitsOfTeam(target.team).filter(unit => !unit.getBleed(sourceID))
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
					getBestSortedAsMax(false, getInteractableUnitsOfTeam(oldTarget.team), (unit) => unit.coordDistanceSquaredTo(oldTarget) + (unit.getBleed(sourceID) ? 1 : 0))
						.slice(0, spreadCount)
						.forEach(newTarget => {
							newTarget.addBleedIfStrongerThan(sourceID, bleed)
						})
				},
			}
			target.addBleedIfStrongerThan(sourceID, bleed)
			target.setBonusesFor(ChampionKey.Malzahar, [BonusKey.MagicResistShred, mrShredProportion, elapsedMS + durationMS])
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

	[ChampionKey.Orianna]: {
		cast: (elapsedMS, spell, champion) => {
			const hexRange = 2 //NOTE hardcoded
			const hotspotHex = randomItem(getHotspotHexes(true, state.units, null, hexRange))
			if (!hotspotHex) { return false }
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
			const mostDistantEnemy = getDistanceUnit(true, champion, champion.opposingTeam())
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
				idealDestination: (target) => randomItem(getHotspotHexes(false, state.units.filter(unit => unit !== target), target.team, 2)),
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
				shape: new ShapeEffectCone(champion, target, HEX_MOVE_LEAGUEUNITS * 2, arcRadians),
				onCollision: (elapsedMS, unit) => {
					const heal = champion.getSpellCalculationResult(spell, 'Healing' as SpellKey)
					champion.gainHealth(elapsedMS, champion, heal, true)
				},
			})
		},
	},

	[ChampionKey.Syndra]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion, champion.opposingTeam())
			if (!target) { return false }
			const targetStunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			// const aoeStunSeconds = champion.getSpellVariable(spell, 'VIPDebutantBonus' as SpellKey) //TODO VIP
			return champion.queueMoveUnitEffect(elapsedMS, spell, {
				target,
				moveSpeed: 1000, //TODO experimentally determine
				idealDestination: (target) => getDistanceUnit(true, champion, target.team)?.activeHex,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: targetStunSeconds * 1000 }],
				],
			})
		},
	},

	[ChampionKey.Talon]: {
		passive: (elapsedMS, spell, target, source) => {
			if (!target) { return true }
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
			const expiresAfterMS = shieldSeconds * 1000
			champion.queueShield(elapsedMS, champion, {
				amount: shieldAmount * (1 + shieldTotalAmp),
				expiresAfterMS,
				onRemoved: (elapsedMS, shield) => {
					champion.manaLockUntilMS = 0
					const hexDistanceFromSource = champion.data.stats.range
					champion.queueHexEffect(elapsedMS, spell, {
						hexDistanceFromSource,
					})
					if (shield.amount > 0) {
						champion.queueHexEffect(elapsedMS, undefined, {
							hexDistanceFromSource,
							damageCalculation: champion.getSpellCalculation(spell, 'BonusDamage' as SpellKey),
						})
					} else {
						champion.addBonuses(ChampionKey.Vex, [shieldKey, shieldAmp])
					}
				},
			})
			champion.manaLockUntilMS = 60 * 1000
			return true
		},
	},

	[ChampionKey.Warwick]: {
		passive: (elapsedMS, spell, target, source) => {
			if (!target) { return true }
			const heal = source.getSpellCalculationResult(spell, SpellKey.HealAmount)
			const percentHealthDamage = source.getSpellCalculationResult(spell, SpellKey.PercentHealth) / 100
			const damageCalculation = createDamageCalculation(SpellKey.PercentHealth, percentHealthDamage, DamageType.magic, BonusKey.CurrentHealth, true, 1)
			target.takeBonusDamage(elapsedMS, source, damageCalculation, false)
			source.gainHealth(elapsedMS, source, heal, true)
			return true
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetHex = champion.target?.activeHex
			if (!targetHex) { return false }
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
