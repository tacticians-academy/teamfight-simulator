import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

import { ShapeEffectCircle, ShapeEffectCone } from '#/game/ShapeEffect'
import { state } from '#/game/store'

import { getMostDistanceHex, getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { toRadians } from '#/helpers/angles'
import { getHotspotHexes, getFarthestUnitOfTeamWithinRangeFrom, getSurroundingWithin } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { HEX_MOVE_LEAGUEUNITS, MAX_HEX_COUNT } from '#/helpers/constants'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { ChampionFns } from '#/helpers/types'

export default {

	[ChampionKey.Ahri]: {
		cast: (elapsedMS, spell, champion) => {
			const missileSpell = champion.getSpellFor('OrbMissile')
			const degreesBetweenOrbs = champion.getSpellVariable(spell, 'AngleBetweenOrbs' as SpellKey)
			const radiansBetweenOrbs = toRadians(degreesBetweenOrbs)
			const damageMultiplier = champion.getSpellVariable(spell, 'MultiOrbDamage' as SpellKey)
			const orbsPerCast = champion.getSpellVariable(spell, 'SpiritFireStacks' as SpellKey)
			const maxRange = champion.getSpellVariable(spell, 'HexRange' as SpellKey)
			const orbCount = champion.castCount * orbsPerCast + 1
			const orbOffsetRadians = orbCount % 2 === 0 ? radiansBetweenOrbs / 2 : 0
			for (let castIndex = 0; castIndex < orbCount; castIndex += 1) {
				champion.queueProjectileEffect(elapsedMS, spell, {
					fixedHexRange: maxRange,
					destroysOnCollision: false,
					modifiesOnMultiHit: true,
					damageMultiplier,
					changeRadians: orbOffsetRadians + radiansBetweenOrbs * Math.ceil(castIndex / 2) * (castIndex % 2 === 0 ? 1 : -1),
					missile: missileSpell?.missile,
					returnMissile: champion.getSpellFor('OrbReturn')?.missile ?? missileSpell?.missile,
					onTargetDeath: 'continue',
				})
			}
		},
	},

	[ChampionKey.Blitzcrank]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: getDistanceUnit(false, champion),
				returnMissile: spell.missile,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
				onCollision: (elapsedMS, affectedUnit) => {
					champion.performActionUntilMS = 0
					const adjacentHex = affectedUnit.projectHexFrom(champion, false)
					if (adjacentHex) {
						affectedUnit.moving = true
						affectedUnit.customMoveSpeed = spell.missile?.speedInitial
						affectedUnit.setActiveHex(adjacentHex) //TODO travel time
						champion.alliedUnits().forEach(unit => unit.target = affectedUnit) //TODO target if in range
						champion.empoweredAutos.add({
							amount: 1,
							statusEffects: [
								[StatusEffectType.stunned, { durationMS: 1 * 1000 }], //NOTE investigate in data
							],
						})
					}
				},
			})
			champion.performActionUntilMS = 60 * 1000
		},
	},

	[ChampionKey.Braum]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: MAX_HEX_COUNT,
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
		},
	},

	[ChampionKey.Caitlyn]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion)
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				destroysOnCollision: true,
				onTargetDeath: 'farthest',
			})
		},
	},

	[ChampionKey.Camille]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCone(champion, champion.angleTo(target), HEX_MOVE_LEAGUEUNITS * 2, toRadians(66)),
			})
		},
	},

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS * 1.125),
				onCollision: (elapsedMS, affectedUnit) => {
					champion.gainHealth(elapsedMS, champion, champion.getSpellCalculationResult(spell, SpellKey.Heal)!, true)
				},
			})
		},
	},

	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueProjectileEffect(elapsedMS, spell, {
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
			if (!target) { return console.log('ERR', 'No target', champion.name, spell.name) }
			champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				missile: boulderSpell.missile,
				destroysOnCollision: false,
			})
		},
	},

	[ChampionKey.Kassadin]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueProjectileEffect(elapsedMS, spell, {
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

	[ChampionKey.Tryndamere]: {
		cast: (elapsedMS, spell, champion) => {
			const densestEnemyHexes = getHotspotHexes(true, state.units, champion.opposingTeam(), 1)
			const farthestDenseHex = getMostDistanceHex(false, champion, densestEnemyHexes)
			if (!farthestDenseHex) { console.log('ERR', champion.name, spell.name, densestEnemyHexes) }
			const projectedHex = champion.projectHexFromHex(farthestDenseHex ?? champion.activeHex, true)
			if (!projectedHex) { console.log('ERR', champion.name, spell.name, farthestDenseHex) }
			champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion, HEX_MOVE_LEAGUEUNITS),
				expiresAfterMS: 0.5 * 1000, //TODO
				onActivate: (elapsedMS, champion) => {
					champion.moving = true
					champion.setActiveHex(projectedHex ?? champion.activeHex)
					champion.customMoveSpeed = 2000
					champion.empoweredAutos.add({
						amount: 3, //NOTE hardcoded
						damageMultiplier: champion.getSpellVariable(spell, 'BonusAAPercent' as SpellKey),
					})
				},
			})
		},
	},

	[ChampionKey.Vex]: {
		cast: (elapsedMS, spell, champion) => {
			const shieldKey = 'VexShieldMultiplier' as BonusKey
			const shieldAmount = champion.getSpellVariable(spell, 'ShieldAmount' as SpellKey)
			const shieldSeconds = champion.getSpellVariable(spell, 'ShieldDuration' as SpellKey)
			const shieldAmp = champion.getSpellVariable(spell, 'ShieldAmp' as SpellKey)
			const shieldTotalAmp = champion.getBonuses(shieldKey)
			champion.shields.push({
				source: champion,
				amount: shieldAmount * (1 + shieldTotalAmp),
				expiresAtMS: elapsedMS + shieldSeconds * 1000,
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
		},
	},

	[ChampionKey.Warwick]: {
		passive: (elapsedMS, spell, target, source) => {
			if (!target) { return }
			const heal = source.getSpellCalculationResult(spell, SpellKey.HealAmount)
			const percentHealthDamage = source.getSpellCalculationResult(spell, SpellKey.PercentHealth) / 100
			const damageCalculation = createDamageCalculation(SpellKey.PercentHealth, target.health * percentHealthDamage, DamageType.magic)
			target.damage(elapsedMS, false, source, DamageSourceType.attack, damageCalculation, false)
			source.gainHealth(elapsedMS, source, heal, true)
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetHex = champion.target?.activeHex
			if (!targetHex) { return console.log('No target', champion.name, champion.team) }
			const centerHexes = [targetHex]
			const outerHexes = getSurroundingWithin(targetHex, 1)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: centerHexes,
			})
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: outerHexes,
				damageMultiplier: -0.5,
			})
		},
	},

	[ChampionKey.Zyra]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getRowOfMostAttackable(champion.opposingTeam()),
				statusEffects: [
					[StatusEffectType.stunned, { durationMS: stunSeconds * 1000 }],
				],
			})
		},
	},

} as {[key in ChampionKey]?: ChampionFns}
