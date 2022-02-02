import { getRowOfMost } from '#/helpers/abilityUtils'
import { HexEffect } from '#/helpers/HexEffect'
import type { AbilityFn } from '#/helpers/types'

export const hexEffects: HexEffect[] = []
export const projectiles = []

export default {
	Zyra: (elapsedMS, champion) => {
		hexEffects.push(new HexEffect(champion, elapsedMS, {
			hexes: getRowOfMost(champion.opposingTeam()),
			damage: champion.getAbilityValue('Damage'),
			stunSeconds: champion.getAbilityValue('StunDuration'),
		}))
	},
} as Record<string, AbilityFn>
