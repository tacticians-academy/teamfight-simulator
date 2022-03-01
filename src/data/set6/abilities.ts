import { getDistanceUnit, getRowOfMost } from '#/helpers/abilityUtils'
import { getSurrounding } from '#/helpers/boardUtils'
import type { AbilityFn } from '#/helpers/types'
import {ChampionUnit} from "#/game/ChampionUnit"

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
	Darius: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getSurrounding(champion.activePosition, 1),
			onCollision: (affectedUnit: ChampionUnit) => {
				champion.gainHealth(champion.getSpellValue('Heal'))
			},
		})
	},
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMost(champion.opposingTeam()),
			stunSeconds: champion.getSpellValue('StunDuration'),
		})
	},
	Ziggs: (elapsedMS, spell, champion) => {
		const target = champion.target
		if (!target) {
			return console.log('No target', champion.name, champion.team)
		}
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: [target.activePosition],
		})
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getSurrounding(target.activePosition, 1),
			damage: champion.getSpellValue('Damage') * 0.5,
		})
	},
} as Record<string, AbilityFn>
