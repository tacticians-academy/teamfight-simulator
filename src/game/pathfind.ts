import type { ChampionUnit } from '#/game/ChampionUnit'

import { buildBoard, containsHex, getHexRing, isSameHex } from '#/helpers/boardUtils'
import type { HexCoord } from '#/helpers/types'

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
		const surroundingHexes = getHexRing(hex)
		for (const surroundingHex of surroundingHexes) {
			const wasAlreadyChecked = containsHex(surroundingHex, checkedHexes)
			if (wasAlreadyChecked) {
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

export function updatePaths(units: ChampionUnit[]) {
	const searchFromHexes: [HexCoord[], HexCoord[]] = [[], []]
	const unitPositions: HexCoord[] = []
	for (const unit of units) {
		if (unit.hasCollision()) {
			unitPositions.push(unit.activePosition)
		}
		if (!unit.isInteractable()) {
			continue
		}
		searchFromHexes[unit.team].push(unit.activePosition)
	}
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

export function getNextHex(unit: ChampionUnit): HexCoord | null {
	const paths = pathsByTeam[unit.opposingTeam()]
	const [col, row] = unit.activePosition
	const moveTo = paths[col][row]
	return moveTo?.length ? moveTo : null
}
