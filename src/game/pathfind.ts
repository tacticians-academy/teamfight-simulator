import type { ChampionUnit } from '#/game/ChampionUnit'

import { buildBoard, containsHex, getHexRing, isSameHex } from '#/helpers/boardUtils'
import type { HexCoord } from '#/helpers/types'

let pathsByTeam: [HexCoord[][], HexCoord[][]] = [[], []]

let needsUpdate = false

export function needsPathfindingUpdate() {
	needsUpdate = true
}

function recursiveSearch(unitHexes: HexCoord[], hexes: HexCoord[], checkedHexes: HexCoord[] = [], results: HexCoord[][] = []): HexCoord[][] {
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
			const isOccupied = containsHex(surroundingHex, unitHexes)
			if (!isOccupied) {
				newSearchHexes.push(surroundingHex)
			}
			if (!isFirstStep) {
				results[surroundingHex[0]][surroundingHex[1]] = hex
			}
		}
	}
	return newSearchHexes.length ? recursiveSearch(unitHexes, newSearchHexes, checkedHexes, results) : results
}

export function updatePathsIfNeeded(units: ChampionUnit[]) {
	if (!needsUpdate) {
		return
	}
	needsUpdate = false

	const searchFromHexes: [HexCoord[], HexCoord[]] = [[], []]
	const unitHexes: HexCoord[] = []
	for (const unit of units) {
		if (unit.hasCollision()) {
			unitHexes.push(unit.activeHex)
		}
		if (!unit.isAttackable()) {
			continue
		}
		searchFromHexes[unit.team].push(unit.activeHex)
	}
	pathsByTeam = searchFromHexes.map(teamHexes => recursiveSearch(unitHexes, teamHexes)) as [HexCoord[][], HexCoord[][]]
}

export function getNextHex(unit: ChampionUnit): HexCoord | null {
	const paths = pathsByTeam[unit.opposingTeam()]
	const [col, row] = unit.activeHex
	const moveTo = paths[col][row]
	return moveTo?.length ? moveTo : null
}
