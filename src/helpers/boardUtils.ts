import type { ChampionUnit } from '#/game/unit'

import { BOARD_COL_COUNT, BOARD_ROW_COUNT } from '#/helpers/constants'
import type { HexCoord, TeamNumber } from '#/helpers/types'

const lastCol = BOARD_COL_COUNT - 1
const lastRow = BOARD_ROW_COUNT - 1

export function buildBoard(fillObjects: boolean | 0): any[][] {
	return [...Array(BOARD_ROW_COUNT)].map(row => [...Array(BOARD_COL_COUNT)].map(col => (fillObjects === 0 ? 0 : (fillObjects ? {} : []))))
}

function nearestAvailableRecursive(hex: HexCoord, unitPositions: HexCoord[]): HexCoord | null {
	if (!containsHex(hex, unitPositions)) {
		return hex
	}
	const surroundingHexes = getSurrounding(hex)
	for (const surroundingHex of surroundingHexes) {
		if (!containsHex(surroundingHex, unitPositions)) {
			return surroundingHex
		}
	}
	for (const surroundingHex of surroundingHexes) {
		const result = nearestAvailableRecursive(surroundingHex, unitPositions)
		if (result) {
			return result
		}
	}
	return null
}
export function getClosestHexAvailableTo(startHex: HexCoord, units: ChampionUnit[]) {
	const unitPositions = units.filter(unit => unit.collides()).map(unit => unit.currentPosition())
	return nearestAvailableRecursive(startHex, unitPositions)
}

const surroundings = [
	[[1, 0], [0, 1], [-1, 1]],
	[[2, 0], [1, 1], [1, 2], [0, 2], [-1, 2], [-2, 1]],
	[[3, 0], [2, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 3], [-2, 2], [-3, 1]],
]

export function getSurrounding([col, row]: HexCoord, atDistance: number = 1): HexCoord[] {
	if (atDistance < 1) {
		return [[col, row]]
	}
	const isOffsetRow = row % 2 === 1
	const validHexes: HexCoord[] = []
	for (let mirror = 0; mirror < 2; mirror += 1) {
		const mirrorMultiplier = mirror === 0 ? 1 : -1
		for (const [colDelta, rowDelta] of surroundings[atDistance - 1]) {
			const isOffsetFromRow = isOffsetRow && rowDelta % 2 !== 0
			const newCol = col + (colDelta + (isOffsetFromRow ? 1 : 0)) * mirrorMultiplier
			const newRow = row + rowDelta * mirrorMultiplier
			if (newCol >= 0 && newCol <= lastCol && newRow >= 0 && newRow <= lastRow) {
				validHexes.push([newCol, newRow])
			}
		}
	}
	return validHexes
}

export function getDensestTargetHexes(units: ChampionUnit[], team: TeamNumber | null, maxDistance: 1 | 2 | 3) {
	const densityBoard = buildBoard(0)
	let densestHexValue = 0
	for (const unit of units) {
		if (team !== null && unit.team !== team) {
			continue
		}
		if (!unit.attackable()) {
			continue
		}
		const position = unit.currentPosition()
		for (let distance = 0; distance <= maxDistance; distance += 1) {
			getSurrounding(position, distance).forEach(([col, row]) => {
				const newValue = densityBoard[row][col] + maxDistance + 1 - distance
				densityBoard[row][col] = newValue
				if (newValue > densestHexValue) {
					densestHexValue = newValue
				}
			})
		}
	}
	const results: HexCoord[] = []
	for (let rowIndex = 0; rowIndex < densityBoard.length; rowIndex += 1) {
		const row = densityBoard[rowIndex]
		for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
			const value = row[colIndex]
			if (value === densestHexValue) {
				results.push([colIndex, rowIndex])
			}
		}
	}
	return results
}

export function isSameHex(a: HexCoord, b: HexCoord) {
	return a[0] === b[0] && a[1] === b[1]
}

export function containsHex(targetHex: HexCoord, hexes: Iterable<HexCoord>) {
	for (const hex of hexes) {
		if (isSameHex(targetHex, hex)) {
			return true
		}
	}
	return false
}

export function getNearestEnemies(unit: ChampionUnit, allUnits: ChampionUnit[], range?: number) {
	let currentRange = 0
	if (range == null) {
		range = unit.range()
	}
	let checkHexes = [unit.currentPosition()]
	const checkedHexes: HexCoord[] = [...checkHexes]
	const enemies: ChampionUnit[] = []
	while (checkHexes.length && !enemies.length) {
		const visitedSurroundingHexes: HexCoord[] = []
		for (const checkHex of checkHexes) {
			for (const surroundingHex of getSurrounding(checkHex)) {
				if (!containsHex(surroundingHex, checkedHexes)) {
					checkedHexes.push(surroundingHex)
					visitedSurroundingHexes.push(surroundingHex)
					for (const checkUnit of allUnits) {
						if (checkUnit.attackable() && checkUnit.team !== unit.team && checkUnit.isAt(surroundingHex)) {
							enemies.push(checkUnit)
						}
					}
				}
			}
		}
		currentRange += 1
		if (currentRange >= range) {
			break
		}
		checkHexes = visitedSurroundingHexes
	}
	return enemies
}

export function hexDistanceFrom(startHex: HexCoord, destHex: HexCoord) {
	let [ currentCol, currentRow ] = destHex
	const [ destCol, destRow ] = startHex
	let distanceAccumulator = 0
	while (currentCol !== destCol && currentRow !== destRow) {
		const isInsetRow = currentRow % 2 === 1
		if (currentRow === destRow) {
			currentCol += currentCol > destCol ? -1 : 1
		} else {
			currentRow += currentRow > destRow ? -1 : 1
			if (currentCol > destCol) {
				if (!isInsetRow) {
					currentCol += -1
				}
			} else {
				if (isInsetRow) {
					currentCol += 1
				}
			}
		}
		distanceAccumulator += 1
	}
	return distanceAccumulator
}

export function getTeamName(team: number) {
	return team === 0 ? 'Blue' : 'Red'
}
