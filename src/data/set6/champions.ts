import { BonusKey } from '@tacticians-academy/academy-library'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { getSurroundingWithin } from '#/helpers/boardUtils'
import { SpellKey } from '#/helpers/types'
import type { ChampionFns } from '#/helpers/types'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

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
				hexes: getSurroundingWithin(champion.activePosition, 1),
				onCollision: (affectedUnit) => {
					champion.gainHealth(champion.getSpellCalculationResult(SpellKey.Heal)!)
				},
			})
		},
	},

	[ChampionKey.Ezreal]: {
		cast: (elapsedMS, spell, champion) => {
			const target = champion.target
			if (!target) { return console.log('No target', champion.name, champion.team) }
			champion.queueProjectile(elapsedMS, spell, {
				target: target.activePosition,
				collidesWith: champion.opposingTeam(),
				destroysOnCollision: true,
				onCollision: () => {
					const allASBoosts = champion.getBonusesFrom(SpellKey.ASBoost)!
					const maxStacks = champion.getSpellVariable(SpellKey.MaxStacks)!
					if (allASBoosts.length < maxStacks) {
						const boostAS = champion.getSpellCalculationResult(SpellKey.ASBoost)! / 5
						champion.bonuses.push([SpellKey.ASBoost, [[BonusKey.AttackSpeed, boostAS]]])
					}
				},
			})
		},
	},

	[ChampionKey.Ziggs]: {
		cast: (elapsedMS, spell, champion) => {
			const targetPosition = champion.target?.activePosition
			if (!targetPosition) { return console.log('No target', champion.name, champion.team) }
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: [targetPosition],
			})
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getSurroundingWithin(targetPosition, 1),
				damageModifier: 0.5,
			})
		},
	},

	[ChampionKey.Zyra]: {
		cast: (elapsedMS, spell, champion) => {
			champion.queueHexEffect(elapsedMS, spell, {
				hexes: getRowOfMostAttackable(champion.opposingTeam()),
				stunSeconds: champion.getSpellVariable(SpellKey.StunDuration),
			})
		},
	},

} as Record<string, ChampionFns>
