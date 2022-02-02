import type { ChampionUnit } from '#/game/unit'

import { DamageType } from '#/helpers/types'
import { getAbilityValue, getRowOfMost } from '#/helpers/abilityUtils'
import { HexEffect } from '#/helpers/HexEffect'

export type AbilityFn = (elapsedMS: DOMHighResTimeStamp, champion: ChampionUnit) => void

export const hexEffects: HexEffect[] = []
export const projectiles = []

export default {
	Zyra: (elapsedMS, champion) => {
		hexEffects.push(new HexEffect(elapsedMS, {
			activatesAfterMS: -1,
			source: champion,
			targetTeam: 1 - champion.team,
			hexes: getRowOfMost(1 - champion.team),
			damage: getAbilityValue('Damage', champion),
			damageType: DamageType.magic,
			stunSeconds: getAbilityValue('StunDuration', champion),
		}))
	},
} as Record<string, AbilityFn>
