import type { EffectVariables } from '@tacticians-academy/academy-library'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { ChampionUnit } from '#/game/ChampionUnit'
import { needsPathfindingUpdate } from '#/game/pathfind'
import { state } from '#/game/store'

import { getClosestHexAvailableTo } from '#/helpers/boardUtils'
import { BOARD_COL_COUNT } from '#/helpers/constants'
import type { HexCoord, StarLevel, TeamNumber } from '#/helpers/types'
import { getArrayValueCounts, randomItem } from '#/helpers/utils'

export function spawnUnit(fromUnit: ChampionUnit, name: string, starLevel: StarLevel) {
	const hex = fromUnit.activeHex
	const spawn = new ChampionUnit(name, getClosestHexAvailableTo(hex, state.units) ?? hex, starLevel)
	spawn.wasSpawned = true
	spawn.genericReset()
	spawn.team = fromUnit.team
	state.units.push(spawn)
	needsPathfindingUpdate()
	return spawn
}

export function getVariables({name, effects, variables}: {name?: string, effects?: EffectVariables, variables?: EffectVariables}, ...keys: string[]) {
	if (effects === undefined) {
		effects = variables
	}
	return keys.map(key => {
		const value = effects![key]
		if (value === undefined) { console.log('ERR', name, key, effects) }
		return value ?? 0
	})
}

export function getUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team))
}

export function getAliveUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => !unit.dead && (team == null || unit.team === team))
}
export function getAliveUnitsOfTeamWithTrait(team: TeamNumber | null, trait: TraitKey) {
	return getAliveUnitsOfTeam(team).filter(unit => unit.hasTrait(trait))
}
export function getAttackableUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team) && unit.isAttackable())
}
export function getInteractableUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team) && unit.isInteractable())
}

export function getRowOfMostAttackable(team: TeamNumber | null) {
	const units = getAttackableUnitsOfTeam(team)
	const unitRows = units.map(unit => unit.activeHex[1])
	const unitsPerRow = getArrayValueCounts(unitRows)
	const maxUnitsInRowCount = unitsPerRow.reduce((previous, current) => Math.max(previous, current[1]), 0)
	const randomRowTarget = randomItem(unitsPerRow.filter(row => row[1] === maxUnitsInRowCount))
	const row = randomRowTarget ? parseInt(randomRowTarget[0], 10) : 0
	return [...Array(BOARD_COL_COUNT).keys()].map((col): HexCoord => [col, row])
}

export function getMostDistanceHex(closest: boolean, fromUnit: ChampionUnit, hexes: HexCoord[]) {
	let bestHex: HexCoord | undefined
	let bestDistance = closest ? 99 : 0
	for (const hex of hexes) {
		const distance = fromUnit.hexDistanceToHex(hex)
		if (closest ? distance < bestDistance : distance > bestDistance) {
			bestDistance = distance
			bestHex = hex
		}
	}
	return bestHex
}

export function getDistanceUnit(closest: boolean, fromUnit: ChampionUnit, team?: TeamNumber | null) {
	const units = getInteractableUnitsOfTeam(team === undefined ? fromUnit.opposingTeam() : team)
	let bestUnit: ChampionUnit | undefined
	let bestDistance = closest ? 99 : 0
	for (const targetUnit of units) {
		if (targetUnit !== fromUnit) {
			const distance = fromUnit.hexDistanceTo(targetUnit)
			if (closest ? distance < bestDistance : distance > bestDistance) {
				bestDistance = distance
				bestUnit = targetUnit
			}
		}
	}
	return bestUnit
}
