import { BonusKey, DamageType } from '@tacticians-academy/academy-library'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { getSurroundingWithin } from '#/helpers/boardUtils'
import { DamageSourceType, SpellKey } from '#/helpers/types'
import type { ChampionFns } from '#/helpers/types'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { createDamageCalculation } from '#/helpers/calculate'

export default {

	[ChampionKey.Caitlyn]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion)
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueProjectileEffect(elapsedMS, spell, {
				target,
				targetTeam: champion.opposingTeam(),
				destroysOnCollision: true,
				retargetOnTargetDeath: true,
			})
		},
	},

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueHexEffect(elapsedMS, spell, { //TODO use coordinate-based collision
				hexDistanceFromSource: 1,
				onCollision: (elapsedMS, affectedUnit) => {
					champion.gainHealth(elapsedMS, champion, champion.getSpellCalculationResult(SpellKey.Heal)!, true)
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
				targetTeam: champion.opposingTeam(),
				destroysOnCollision: true,
				onCollision: (elapsedMS, unit) => {
					const allASBoosts = champion.getBonusesFrom(SpellKey.ASBoost)
					const maxStacks = champion.getSpellVariable(SpellKey.MaxStacks)
					if (allASBoosts.length < maxStacks) {
						const boostAS = champion.getSpellCalculationResult(SpellKey.ASBoost)! / maxStacks
						champion.bonuses.push([SpellKey.ASBoost, [[BonusKey.AttackSpeed, boostAS]]])
					}
				},
			})
		},
	},

	[ChampionKey.Kassadin]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueProjectileEffect(elapsedMS, spell, {
				onCollision: (elapsedMS, affectedUnit) => {
					const manaReave = champion.getSpellVariable(SpellKey.ManaReave)
					const durationSeconds = champion.getSpellVariable(SpellKey.Duration)
					const damageReduction = champion.getSpellVariable(SpellKey.DamageReduction)
					affectedUnit.setBonusesFor(ChampionKey.Kassadin, [BonusKey.ManaReductionPercent, manaReave * -100])
					champion.setBonusesFor(SpellKey.DamageReduction, [BonusKey.DamageReduction, damageReduction / 100, elapsedMS + durationSeconds * 1000])
				},
			})
		},
	},

	[ChampionKey.Warwick]: {
		passive: (elapsedMS, target, source) => {
			const heal = source.getSpellCalculationResult(SpellKey.HealAmount)
			const percentHealthDamage = source.getSpellCalculationResult(SpellKey.PercentHealth) / 100
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
			const stunSeconds = champion.getSpellVariable(SpellKey.StunDuration)
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getRowOfMostAttackable(champion.opposingTeam()),
				statusEffects: {
					stunned: {
						durationMS: stunSeconds * 1000,
						amount: 1,
					},
				},
			})
		},
	},

} as Record<string, ChampionFns>
