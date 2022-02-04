import { addHexEffect } from '#/game/store'

import { getRowOfMost } from '#/helpers/abilityUtils'
import type { AbilityFn } from '#/helpers/types'

export default {
	Zyra: (elapsedMS, champion) => {
		addHexEffect(champion, elapsedMS, {
			hexes: getRowOfMost(champion.opposingTeam()),
			damage: champion.getAbilityValue('Damage'),
			stunSeconds: champion.getAbilityValue('StunDuration'),
		})
	},
} as Record<string, AbilityFn>
