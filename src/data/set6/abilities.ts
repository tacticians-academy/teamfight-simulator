import { getDistanceUnit, getRowOfMost } from '#/helpers/abilityUtils'
import type { AbilityFn } from '#/helpers/types'

export default {
	Caitlyn: (elapsedMS, spell, champion) => {
		const doesTargetNearest = false
		const target = getDistanceUnit(doesTargetNearest, champion)
		if (!target) {
			return console.log('No target', champion.name, champion.team)
		}
		champion.queueProjectile(elapsedMS, {
			spell,
			target,
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: true,
			retargetOnTargetDeath: doesTargetNearest,
		})
	},
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMost(champion.opposingTeam()),
			stunSeconds: champion.getSpellValue('StunDuration'),
		})
	},
} as Record<string, AbilityFn>
