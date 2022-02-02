import { getRowOfMost } from '#/helpers/abilityUtils'
import { HexEffect } from '#/helpers/HexEffect'
import { DamageType } from '#/helpers/types'
import type { AbilityFn } from '#/helpers/types'

export const hexEffects: HexEffect[] = []
export const projectiles = []

export default {
	Zyra: (elapsedMS, champion) => {
		const opposingTeam = 1 - champion.team
		hexEffects.push(new HexEffect(elapsedMS, {
			activatesAfterMS: -1,
			source: champion,
			targetTeam: opposingTeam,
			hexes: getRowOfMost(opposingTeam),
			damage: champion.getAbilityValue('Damage'),
			damageType: DamageType.magic,
			stunSeconds: champion.getAbilityValue('StunDuration'),
		}))
	},
} as Record<string, AbilityFn>
