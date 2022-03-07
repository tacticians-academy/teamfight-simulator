import { BonusKey } from '@tacticians-academy/academy-library'

import { getDistanceUnit, getRowOfMostAttackable } from '#/helpers/abilityUtils'
import { getSurrounding } from '#/helpers/boardUtils'
import { EffectKey } from '#/helpers/types'
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
				champion.gainHealth(champion.getSpellValue('Heal')) //TODO scale AP
			},
		})
	},
	Ezreal: (elapsedMS, spell, champion) => {
		const doesTargetNearest = true
		const target = getDistanceUnit(doesTargetNearest, champion)
		if (!target) {
			return console.log('No target', champion.name, champion.team)
		}
		champion.queueProjectile(elapsedMS, {
			spell,
			target,
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: false,
			retargetOnTargetDeath: doesTargetNearest,
			damage: champion.attackDamage(),
			onCollision: () => {
				const allASBonuses = champion.getBonusFor(EffectKey.AS)
				if (allASBonuses.length < 5) {
					champion.bonuses.push([EffectKey.AS, [[BonusKey.AttackSpeed, 30]]])
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
			damage: champion.getSpellValue('Damage') * 0.5,
		})
	},
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMostAttackable(champion.opposingTeam()),
			stunSeconds: champion.getSpellValue('StunDuration'),
		})
	},
} as Record<string, AbilityFn>
