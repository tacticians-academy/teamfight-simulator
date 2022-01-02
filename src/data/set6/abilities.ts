import type { ChampionUnit } from '#/game/unit'

import { DamageType } from '#/helpers/types'
import { createEffect, getAbilityValue, getRowOfMost } from '#/helpers/abilityUtils'
import type { HexEffect } from '#/helpers/abilityUtils'

export type AbilityFn = (elapsedMS: DOMHighResTimeStamp, champion: ChampionUnit) => void

export const hexEffects: HexEffect[] = []
export const projectiles = []

export default {
	Zyra: (elapsedMS, champion) => {
		hexEffects.push(createEffect(elapsedMS, {
			activatesAtMS: 0,
			source: champion,
			targetTeam: 1 - champion.team,
			hexes: getRowOfMost(1 - champion.team),
			damage: getAbilityValue('Damage', champion),
			damageType: DamageType.magic,
			stunDuration: getAbilityValue('StunDuration', champion),
		}))
	},
} as Record<string, AbilityFn>
