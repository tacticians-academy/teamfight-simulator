import type { ChampionUnit } from '#/game/unit'

import { BOARD_COL_COUNT, BOARD_ROW_COUNT } from '#/helpers/constants'
import type { HexCoord } from '#/helpers/types'

const lastCol = BOARD_COL_COUNT - 1
const lastRow = BOARD_ROW_COUNT - 1

export function buildBoard(fillObjects: boolean): any[][] {
	return [...Array(BOARD_ROW_COUNT)].map(row => [...Array(BOARD_COL_COUNT)].map(col => (fillObjects ? {} : [])))
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

export function getSurrounding([col, row]: HexCoord) {
	const validHexes: HexCoord[] = []
	if (col < lastCol) {
		validHexes.push([col + 1, row])
	}
	if (col > 0) {
		validHexes.push([col - 1, row])
	}
	const isOffsetRow = row % 2 === 1
	if (col > (isOffsetRow ? -1 : 0)) {
		const lookLeft = isOffsetRow ? 0 : -1
		if (row > 0) {
			validHexes.push([col + lookLeft, row - 1])
		}
		if (row < lastRow) {
			validHexes.push([col + lookLeft, row + 1])
		}
	}
	if (col < lastCol + (isOffsetRow ? 0 : 1)) {
		const lookRight = isOffsetRow ? 1 : 0
		if (row > 0) {
			validHexes.push([col + lookRight, row - 1])
		}
		if (row < lastRow) {
			validHexes.push([col + lookRight, row + 1])
		}
	}
	return validHexes
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
