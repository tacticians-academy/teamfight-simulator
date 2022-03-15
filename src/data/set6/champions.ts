import { BonusKey, DamageType } from '@tacticians-academy/academy-library'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { getSurroundingWithin } from '#/helpers/boardUtils'
import { DamageSourceType, SpellKey } from '#/helpers/types'
import type { ChampionFns } from '#/helpers/types'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { createDamageCalculation } from '#/helpers/bonuses'

export default {

	[ChampionKey.Caitlyn]: {
		cast: (elapsedMS, spell, champion) => {
			const target = getDistanceUnit(false, champion)
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueProjectile(elapsedMS, spell, {
				target,
				collidesWith: champion.opposingTeam(),
				destroysOnCollision: true,
				retargetOnTargetDeath: true,
			})
		},
	},

	[ChampionKey.Darius]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueHexEffect(elapsedMS, spell, { //TODO use coordinate-based collision
				hexes: getSurroundingWithin(champion.activeHex, 1),
				onCollision: (elapsedMS, affectedUnit) => {
					champion.gainHealth(elapsedMS, champion.getSpellCalculationResult(SpellKey.Heal)!, true)
				},
			})
		},
	},

	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			champion.queueProjectile(elapsedMS, spell, {
				target: target.activeHex,
				collidesWith: champion.opposingTeam(),
				destroysOnCollision: true,
				onCollision: (elapsedMS, unit) => {
					const allASBoosts = champion.getBonusesFrom(SpellKey.ASBoost)!
					const maxStacks = champion.getSpellVariable(SpellKey.MaxStacks)!
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
			const target = champion.target
			const manaReave = champion.getSpellVariable(SpellKey.ManaReave) ?? 0
			const castTime = champion.getCurrentSpell()?.castTime ?? 0
			champion.queueProjectile(elapsedMS, spell, {
				target,
				onCollision: () => {
					if (!target.getBonusesFrom(SpellKey.ManaReave).length) {
						target.bonuses.push([SpellKey.ManaReave, [[BonusKey.ManaReductionPercent, -100 * manaReave, elapsedMS + castTime]]]) 
					}
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
			source.gainHealth(elapsedMS, heal, true)
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetHex = champion.target?.activeHex
			if (!targetHex) { return console.log('No target', champion.name, champion.team) }
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: [targetHex],
			})
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getSurroundingWithin(targetHex, 1),
				damageMultiplier: 0.5,
			})
		},
	},

	[ChampionKey.Zyra]: {
		cast: (elapsedMS, spell, champion) => {
			const stunSeconds = champion.getSpellVariable(SpellKey.StunDuration)
			if (stunSeconds == null) {
				return console.log('ERR', champion.name, spell.name, spell.variables)
			}
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
