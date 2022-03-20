import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

import { ShapeEffectCircle, ShapeEffectCone } from '#/game/ShapeEffect'
import { state } from '#/game/store'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { toRadians } from '#/helpers/angles'
import { getClosestHexAvailableTo, getClosestUnitOfTeamWithinRangeTo, getFarthestUnitOfTeamWithinRangeFrom, getSurroundingWithin } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { BOARD_ROW_COUNT, HEX_MOVE_LEAGUEUNITS } from '#/helpers/constants'
import { DamageSourceType, SpellKey } from '#/helpers/types'
import type { ChampionFns } from '#/helpers/types'

export default {

	[ChampionKey.Blitzcrank]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.moveUntilMS = elapsedMS + stunSeconds * 1000
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: getDistanceUnit(false, champion),
				statusEffects: {
					stunned: {
						durationMS: stunSeconds * 1000,
					},
				},
				onCollision: (elapsedMS, affectedUnit) => {
					const adjacentHex = champion.getNearestHexTowards(affectedUnit)
					if (adjacentHex) {
						affectedUnit.activeHex = adjacentHex //TODO travel time
						champion.alliedUnits().forEach(unit => unit.target = affectedUnit) //TODO target if in range
						champion.empoweredAuto = {
							statusEffects: {
								stunned: {
									durationMS: 1 * 1000, //NOTE investigate in data
								},
							},
						}
					}
				},
			})
		},
	},

	[ChampionKey.Braum]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.queueProjectileEffect(elapsedMS, spell, {
				destroysOnCollision: false,
				fixedHexRange: BOARD_ROW_COUNT,
				statusEffects: {
					stunned: {
						durationMS: stunSeconds * 1000,
					},
				},
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
				shape: new ShapeEffectCone(champion.coordinatePosition(), champion.angleTo(target), HEX_MOVE_LEAGUEUNITS * 2, toRadians(66)),
			})
		},
	},

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueShapeEffect(elapsedMS, spell, {
				shape: new ShapeEffectCircle(champion.coordinatePosition(), HEX_MOVE_LEAGUEUNITS * 1.125),
				onCollision: (elapsedMS, affectedUnit) => {
					champion.gainHealth(elapsedMS, champion, champion.getSpellCalculationResult(spell, SpellKey.Heal)!, true)
				},
			})
		},
	},

	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueProjectileEffect(elapsedMS, spell, {
				target: target.activeHex,
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
				champion.addBonuses(ChampionKey.Gnar, [BonusKey.ManaReduction, manaReduction, expiresAt], [BonusKey.HexRangeIncrease, -rangeReduction, expiresAt])
				if (target) {
					const jumpToHex = target.getNearestHexTowards(champion)
					if (jumpToHex) {
						champion.activeHex = jumpToHex //TODO travel time
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
				damageMultiplier: 0.5,
			})
		},
	},

	[ChampionKey.Zyra]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(spell, SpellKey.StunDuration)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getRowOfMostAttackable(champion.opposingTeam()),
				statusEffects: {
					stunned: {
						durationMS: stunSeconds * 1000,
					},
				},
			})
		},
	},

} as Record<string, ChampionFns>
