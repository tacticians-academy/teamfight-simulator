import { state } from '#/game/store'
import type { ChampionUnit } from '#/game/unit'

import { BOARD_COL_COUNT } from '#/helpers/constants'
import type { DamageType, HexCoord, TeamNumber } from '#/helpers/types'
import { getArrayValueCounts, randomItem } from '#/helpers/utils'

const DEFAULT_CAST_MS = 500
const DEFAULT_MANA_LOCK_MS = 1000

export interface HexEffect {
	activatesAtMS: DOMHighResTimeStamp
	source: ChampionUnit
	targetTeam: number
	hexes: HexCoord[]
	damage?: number
	damageType?: DamageType
	stunDuration?: number
}

export function getAbilityValue(name: string, champion: ChampionUnit) {
	const entry = champion.data.ability.variables.find(valueObject => valueObject.name === name)
	if (!entry) {
		return undefined
	}
	return entry.value?.[champion.starLevel]
}

export function createEffect(elapsedMS: DOMHighResTimeStamp, effect: HexEffect) {
	if (effect.activatesAtMS === 0) {
		effect.activatesAtMS = elapsedMS + DEFAULT_CAST_MS
	}
	effect.source.attackStartAtMS = effect.activatesAtMS
	effect.source.manaLockUntilMS = effect.activatesAtMS + DEFAULT_MANA_LOCK_MS
	if (effect.stunDuration != null) {
		effect.stunDuration *= 1000
	}
	return effect
}

function getUnitsOfTeam(team: number) {
	return team > 1 ? state.units : state.units.filter(unit => unit.team === team)
}

export function getRowOfMost(team: number) {
	const units = getUnitsOfTeam(team)
	const unitRows = units.map(unit => unit.currentPosition()[1])
	const unitsPerRow = getArrayValueCounts(unitRows)
	const maxUnitsInRowCount = unitsPerRow.reduce((previous, current) => Math.max(previous, current[1]), 0)
	const randomRowTarget = randomItem(unitsPerRow.filter(row => row[1] === maxUnitsInRowCount))
	const row = randomRowTarget ? parseInt(randomRowTarget[0], 10) : 0
	return [...Array(BOARD_COL_COUNT).keys()].map((col): HexCoord => [col, row])
}
