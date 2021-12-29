import type { HexCoord, HexVector } from '#/game/types'
import type { UnitData } from '#/game/unit'

import { containsHex, getSurrounding } from '#/game/boardUtils'

let paths: [HexVector[], HexVector[]] = [[], []]

function search(unitPositions: HexCoord[], hexes: HexCoord[], checkedHexes: HexCoord[] = [], results: HexVector[] = []): HexVector[] {
	const isFirstStep = !checkedHexes.length
	if (isFirstStep) {
		checkedHexes.push(...hexes)
	}
	const newSearchHexes: HexCoord[] = []
	for (const hex of hexes) {
		const surroundingHexes = getSurrounding(hex)
		for (const surroundingHex of surroundingHexes) {
			if (!containsHex(surroundingHex, checkedHexes)) {
				checkedHexes.push(surroundingHex)
				if (!containsHex(surroundingHex, unitPositions)) {
					newSearchHexes.push(surroundingHex)
				}
				if (!isFirstStep) {
					results.push([hex, surroundingHex])
				}
			}
		}
	}
	return newSearchHexes.length ? search(unitPositions, newSearchHexes, checkedHexes, results) : results
}

export function updatePaths(units: UnitData[]) {
	const searchFromHexes: [HexCoord[], HexCoord[]] = [[], []]
	for (const unit of units) {
		searchFromHexes[unit.team].push(unit.currentPosition())
	}
	const unitPositions = units.map(unit => unit.currentPosition())
	paths = searchFromHexes.map(teamHexes => search(unitPositions, teamHexes)) as [HexVector[], HexVector[]]
	// console.log(paths) //SAMPLE
}
