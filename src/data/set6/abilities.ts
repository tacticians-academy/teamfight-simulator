import { getRowOfMost } from '#/helpers/abilityUtils'
import type { AbilityFn } from '#/helpers/types'

export default {
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMost(champion.opposingTeam()),
			damage: champion.getSpellValue('Damage'),
			stunSeconds: champion.getSpellValue('StunDuration'),
		})
	},
} as Record<string, AbilityFn>
