import type { HexCoord } from '#/game/types'
import type { UnitData } from '#/game/unit'

import { buildBoard, containsHex, getSurrounding, isSameHex } from '#/game/boardUtils'

let pathsByTeam: [HexCoord[][], HexCoord[][]] = [[], []]

function recursiveSearch(unitPositions: HexCoord[], hexes: HexCoord[], checkedHexes: HexCoord[] = [], results: HexCoord[][] = []): HexCoord[][] {
	if (!results.length) {
		results = buildBoard(false)
	}
	const isFirstStep = !checkedHexes.length
	if (isFirstStep) {
		checkedHexes.push(...hexes)
	}
	const newSearchHexes: HexCoord[] = []
	for (const hex of hexes) {
		const surroundingHexes = getSurrounding(hex)
		for (const surroundingHex of surroundingHexes) {
			const alreadyChecked = containsHex(surroundingHex, checkedHexes)
			if (alreadyChecked) {
				continue
			}
			checkedHexes.push(surroundingHex)
			const isOccupied = containsHex(surroundingHex, unitPositions)
			if (!isOccupied) {
				newSearchHexes.push(surroundingHex)
			}
			if (!isFirstStep) {
				results[surroundingHex[0]][surroundingHex[1]] = hex
			}
		}
	}
	return newSearchHexes.length ? recursiveSearch(unitPositions, newSearchHexes, checkedHexes, results) : results
}

let previousUnitPositions: HexCoord[] = []

export function updatePaths(units: UnitData[]) {
	const searchFromHexes: [HexCoord[], HexCoord[]] = [[], []]
	for (const unit of units) {
		if (!unit.attackable()) {
			continue
		}
		searchFromHexes[unit.team].push(unit.currentPosition())
	}
	const unitPositions = [...searchFromHexes[0], ...searchFromHexes[1]]
	const unitsCount = unitPositions.length
	let hasChangedUnit = unitsCount !== previousUnitPositions.length
	if (!hasChangedUnit) {
		for (let index = 0; index < unitsCount; index += 1) {
			if (!isSameHex(unitPositions[index], previousUnitPositions[index])) {
				hasChangedUnit = true
				break
			}
		}
	}
	if (!hasChangedUnit) {
		return
	}
	previousUnitPositions = unitPositions
	pathsByTeam = searchFromHexes.map(teamHexes => recursiveSearch(unitPositions, teamHexes)) as [HexCoord[][], HexCoord[][]]
}

export function getNextHex(unit: UnitData): HexCoord | null {
	const paths = pathsByTeam[1 - unit.team]
	const [col, row] = unit.currentPosition()
	const moveTo = paths[col][row]
	return moveTo?.length ? moveTo : null
}
