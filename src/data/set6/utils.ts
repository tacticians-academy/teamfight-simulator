import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { getters, state } from '#/game/store'

import { getVariables } from '#/helpers/abilityUtils'
import { getHexRing, getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import type { HexCoord, TeamNumber } from '#/helpers/types'

export const INNOVATION_NAMES = [ChampionKey.MalzaharVoidling, ChampionKey.Tibbers, ChampionKey.HexTechDragon]

export function getSocialiteHexesFor(team: TeamNumber): [statMultiplier: number, hexes: HexCoord[]][] {
	const teamAugments = getters.activeAugmentEffectsByTeam.value[team]
	const duetAugment = teamAugments.find(([augment]) => augment.groupID === AugmentGroupKey.Duet)
	const shareTheSpotlightAugment = teamAugments.find(([augment]) => augment.groupID === AugmentGroupKey.ShareTheSpotlight)?.[0]
	const socialiteHexes = (duetAugment ? state.socialiteHexes : [state.socialiteHexes[0]]).filter((hex): hex is HexCoord => !!hex)
	const secondaryHexes = shareTheSpotlightAugment ? socialiteHexes.flatMap(hex => getHexRing(hex)) : []
	const sharePercent = shareTheSpotlightAugment ? getVariables(shareTheSpotlightAugment, 'PercentStats')[0] : 0
	return [[1, socialiteHexes], [sharePercent / 100, secondaryHexes]]
}

export function getUnitsInSocialiteHexes(team: TeamNumber, units: ChampionUnit[]): [statMultiplier: number, units: ChampionUnit[]][] {
	return getSocialiteHexesFor(team).map(([statsModifier, socialiteHexes]) => {
		return [statsModifier, units.filter(unit => {
			const mirrorHex = getMirrorHex(unit.startHex)
			return socialiteHexes.some(hex => isSameHex(hex, mirrorHex))
		})]
	})
}
