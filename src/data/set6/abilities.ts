import { BonusKey } from '@tacticians-academy/academy-library'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { getSurrounding } from '#/helpers/boardUtils'
import { DamageType, SpellKey } from '#/helpers/types'
import type { AbilityFn } from '#/helpers/types'

export default {
	Caitlyn: (elapsedMS, spell, champion) => {
		const target = getDistanceUnit(false, champion)
		if (!target) { return console.log('No target', champion.name, champion.team) }
		champion.queueProjectile(elapsedMS, {
			spell,
			target,
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: true,
			retargetOnTargetDeath: true,
		})
	},
	Darius: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, { //TODO use coordinate-based collision
			spell,
			hexes: getSurrounding(champion.activePosition, 1),
			onCollision: (affectedUnit) => {
				champion.gainHealth(champion.getSpellValue(SpellKey.Heal)) //TODO scale AP
			},
		})
	},
	Ezreal: (elapsedMS, spell, champion) => {
		const target = champion.target
		if (!target) { return console.log('No target', champion.name, champion.team) }
		champion.queueProjectile(elapsedMS, {
			spell,
			target, //TODO target hex, not champion
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: true,
			damage: champion.attackDamage(),
			damageType: DamageType.physical,
			onCollision: () => {
				const allASBonuses = champion.getBonusesFor(SpellKey.ASBoost)
				const maxStacks = champion.getSpellValue(SpellKey.MaxStacks)
				if (allASBonuses.length < maxStacks) {
					const asBoost = champion.getSpellValue(SpellKey.ASBoost)
					champion.bonuses.push([SpellKey.ASBoost, [[BonusKey.AttackSpeed, asBoost * 100]]]) //TODO scale AP
				}
			},
		})
	},
	Ziggs: (elapsedMS, spell, champion) => {
		const targetPosition = champion.target?.activePosition
		if (!targetPosition) { return console.log('No target', champion.name, champion.team) }
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: [targetPosition],
		})
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getSurrounding(targetPosition, 1),
			damage: champion.getSpellValue(SpellKey.Damage) * 0.5,
		})
	},
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMostAttackable(champion.opposingTeam()),
			stunSeconds: champion.getSpellValue(SpellKey.StunDuration),
		})
	},
} as Record<string, AbilityFn>
