import { setData } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'

import { doesLineInterceptCircle } from '#/sim/helpers/angles'
import { BOARD_COL_COUNT, BOARD_MAX_ROW_COUNT, HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT, MAX_HEX_COUNT } from '#/sim/helpers/constants'
import { containsHex, isSameHex } from '#/sim/helpers/hexes'
import type { HexCoord, HexRowCol, TeamNumber } from '#/sim/helpers/types'
import { getBestRandomAsMax } from '#/sim/helpers/utils'

const surroundings: [HexCoord[], HexCoord[], HexCoord[], HexCoord[]] = [
	[[1, 0], [0, 1], [-1, 1]],
	[[2, 0], [1, 1], [1, 2], [0, 2], [-1, 2], [-2, 1]],
	[[3, 0], [2, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 3], [-2, 2], [-3, 1]],
	[[4, 0], [3, 1], [3, 2], [2, 3], [2, 4], [1, 4], [0, 4], [-1, 4], [-2, 4], [-3, 3], [-3, 2], [-4, 1]],
]

export type SurroundingHexRange = 0 | 1 | 2 | 3 | 4

export function createEmptyBoard(rowCount: number) {
	return [...Array(rowCount)].map(() => [...Array(BOARD_COL_COUNT).fill(0) as number[]])
}

export function getClosestHexAvailableTo(startHex: HexCoord, units: ChampionUnit[]) {
	const unitHexes = getOccupiedHexes(units)
	if (!containsHex(startHex, unitHexes)) {
		return startHex
	}
	for (let distance = 1; distance <= 4; distance += 1) { //TODO recurse to unlimited distance
		for (const checkHex of getHexRing(startHex, distance as SurroundingHexRange)) {
			if (!containsHex(checkHex, unitHexes)) { //TODO random
				return checkHex
			}
		}
	}
	console.error('No available hex', startHex, unitHexes)
}

export function getDistanceUnitOfTeamWithinRangeTo(isMaximum: boolean, target: ChampionUnit | HexCoord, maxHexDistance: number | undefined, validUnits: ChampionUnit[]) {
	return getBestRandomAsMax(isMaximum, validUnits, (unit) => {
		return maxHexDistance != null && unit.hexDistanceTo(target) > maxHexDistance ? undefined : unit.coordDistanceSquaredTo(target)
	})
}

export function getAdjacentRowUnitsTo(maxDistance: number, targetHex: HexCoord, units: ChampionUnit[]) {
	const [targetCol, targetRow] = targetHex
	return units
		.filter(unit => {
			if (!unit.startHex) return false
			const [unitCol, unitRow] = unit.startHex
			return unitRow === targetRow && unitCol !== targetCol && Math.abs(targetCol - unitCol) <= maxDistance
		})
}

export function isInBackLines(unit: ChampionUnit) {
	const row = unit.activeHex[1]
	return row < 2 || row >= setData.rowsTotal - 2
}

export function getOccupiedHexes(units: ChampionUnit[]) {
	return units
		.filter(unit => unit.hasCollision())
		.map(unit => unit.activeHex!)
}

export function getHexesSurroundingWithin(hex: HexCoord, maxDistance: SurroundingHexRange, includingOrigin: boolean): HexCoord[] {
	const results: HexCoord[] = []
	for (let distance = 1; distance <= maxDistance; distance += 1) {
		results.push(...getHexRing(hex, distance as SurroundingHexRange))
	}
	if (includingOrigin) {
		results.push([...hex])
	}
	return results
}

export function getHexRing([col, row]: HexCoord, atDistance: SurroundingHexRange = 1): HexCoord[] {
	if (atDistance < 1) {
		return [[col, row]]
	}
	const isOffsetRow = row % 2 === 1
	const validHexes: HexCoord[] = []
	const lastColIndex = BOARD_COL_COUNT - 1
	const lastRowIndex = setData.rowsTotal - 1
	for (let mirror = 0; mirror < 2; mirror += 1) {
		const rowMultiplier = mirror === 0 ? 1 : -1
		for (const [colDelta, rowDelta] of surroundings[atDistance - 1]) {
			const isCheckOffsetFromRow = isOffsetRow && rowDelta % 2 !== 0
			const colMultiplier = rowDelta === 0 ? rowMultiplier : 1
			const newCol = col + (colDelta + (isCheckOffsetFromRow ? 1 : 0)) * colMultiplier
			const newRow = row + rowDelta * rowMultiplier
			if ((newCol >= 0 && newCol <= lastColIndex) && (newRow >= 0 && newRow <= lastRowIndex)) {
				validHexes.push([newCol, newRow])
			}
		}
	}
	return validHexes
}

// Board hexes/coords

export function calculateCoordForHex(colIndex: number, rowIndex: number): HexCoord {
	const hexInset = HEX_PROPORTION / 2
	const rowInset = rowIndex % 2 === 1 ? hexInset : 0
	return [(colIndex + 0.5) * HEX_PROPORTION + rowInset, (rowIndex + 0.5) * HEX_PROPORTION - rowIndex * hexInset / 2]
}

export const boardRowsCols: HexRowCol[][] = createEmptyBoard(BOARD_MAX_ROW_COUNT)
	.map((row, rowIndex) => {
		return row.map((col, colIndex) => {
			return {
				hex: [colIndex, rowIndex],
				coord: calculateCoordForHex(colIndex, rowIndex),
			}
		})
	})

export function getProjectedHexLineFrom(fromUnit: ChampionUnit, toUnit: ChampionUnit) {
	const fromCoord = fromUnit.coord
	const [projectedX, projectedY] = toUnit.coord
	const dX = (projectedX - fromCoord[0]) * MAX_HEX_COUNT
	const dY = (projectedY - fromCoord[1]) * MAX_HEX_COUNT
	const results: [number, HexCoord][] = []
	boardRowsCols.forEach(row => {
		row.forEach(colRow => {
			if (doesLineInterceptCircle(colRow.coord, HEX_PROPORTION / 2, fromCoord, [dX, dY])) {
				results.push([fromUnit.coordDistanceSquaredTo(colRow), colRow.hex])
			}
		})
	})
	results.sort((a, b) => a[0] - b[0])
	return results.map(entry => entry[1])
}

export function getProjectedHexAtAngleTo(target: ChampionUnit, fromUnit: ChampionUnit, radiansChange: number, atDistance: number) {
	const angle = target.angleTo(fromUnit) + radiansChange
	const [sourceX, sourceY] = fromUnit.coord
	const deltaX = Math.cos(angle) * atDistance
	const deltaY = Math.sin(angle) * atDistance
	console.log(sourceX, sourceY, deltaX, deltaY)
	const idealCoord: HexCoord = [sourceX + deltaX, sourceY + deltaY]
	const allHexRowsCols = boardRowsCols.flatMap(row => row.map(col => col))
	const bestHexRowCol = getBestRandomAsMax(false, allHexRowsCols, (hexRowCol) => coordinateDistanceSquared(hexRowCol.coord, idealCoord))
	// console.log(JSON.stringify(fromUnit.activeHex), JSON.stringify(bestHexRowCol?.hex))
	return bestHexRowCol?.hex
}

export function getCoordFrom(hex: HexCoord | undefined): HexCoord {
	if (!hex) {
		return [0, 0]
	}
	const [col, row] = hex
	const hexRowCol = boardRowsCols[row]?.[col] as HexRowCol | undefined
	// return hex ? [...hex.coord] : calculateCoordForHex(col, row)
	if (hexRowCol) {
		return [...hexRowCol.coord]
	}
	console.warn('Coord for hex outside board', col, row)
	return calculateCoordForHex(col, row)
}

export function getOuterHexes() {
	const outerHexes: HexCoord[] = []
	const lastOuterRow = setData.rowsTotal
	const lastOuterCol = BOARD_COL_COUNT
	for (let rowIndex = -1; rowIndex <= lastOuterRow; rowIndex += 1) {
		if (rowIndex === -1 || rowIndex === lastOuterRow) {
			for (let colIndex = -1; colIndex <= lastOuterCol; colIndex += 1) {
				outerHexes.push([colIndex, rowIndex])
			}
		} else {
			outerHexes.push([-1, rowIndex], [lastOuterCol, rowIndex])
		}
	}
	return outerHexes
}
export function getEdgeHexes() {
	const edgeHexes: HexCoord[] = []
	boardRowsCols.forEach((row, rowIndex) => {
		if (rowIndex === 0 || rowIndex === setData.rowsTotal - 1) {
			edgeHexes.push(...row.map(rowCol => rowCol.hex))
		} else {
			edgeHexes.push(row[0].hex, row[BOARD_COL_COUNT - 1].hex)
		}
	})
	return edgeHexes
}

export function getHexRow(row: number) {
	return boardRowsCols[row].map(rowCol => rowCol.hex)
}

export function getBestDensityHexes(isMaximum: boolean, units: ChampionUnit[], includingUnderTargetUnit: boolean, maxDistance: SurroundingHexRange) {
	const densityBoard = createEmptyBoard(setData.rowsTotal)
	let results: HexCoord[] = []
	let bestHexValue = isMaximum ? 0 : Number.MAX_SAFE_INTEGER
	units.forEach(unit => {
		for (let distance = (includingUnderTargetUnit ? 0 : 1); distance <= maxDistance; distance += 1) {
			getHexRing(unit.activeHex, distance as SurroundingHexRange).forEach(surroundingHex => {
				const [col, row] = surroundingHex
				const newValue = densityBoard[row][col] + maxDistance + 1 - distance
				densityBoard[row][col] = newValue
				if (isMaximum) {
					if (newValue > bestHexValue) {
						results = [surroundingHex]
						bestHexValue = newValue
					} else if (newValue === bestHexValue) {
						results.push(surroundingHex)
					}
				}
			})
		}
	})
	if (!isMaximum) {
		densityBoard.forEach((rowScores, rowIndex) => {
			rowScores.forEach((rowColScore, colIndex) => {
				if (rowColScore === 0) return

				const hex: HexCoord = [colIndex, rowIndex]
				if (rowColScore < bestHexValue) {
					bestHexValue = rowColScore
					results = [hex]
				} else if (rowColScore === bestHexValue) {
					results.push(hex)
				}
			})
		})
	}
	return results
}

export function getFrontBehindHexes(unit: ChampionUnit, inFront: boolean) {
	const [unitCol, unitRow] = unit.activeHex
	const projectingRowDirection = (unit.team === 0 ? -1 : 1) * (inFront ? 1 : -1)
	return getHexRing(unit.activeHex).filter(([col, row]) => row - unitRow === projectingRowDirection)
}

export function coordinateDistanceSquared([startX, startY]: HexCoord, [destX, destY]: HexCoord) {
	const diffX = destX - startX
	const diffY = destY - startY
	return diffX * diffX + diffY * diffY
}

export function radiusToHexProportion(radius: number) {
	return radius * 2 * HEX_PROPORTION_PER_LEAGUEUNIT
}

export function hexDistanceFrom(startHex: HexCoord, destHex: HexCoord) {
	let [ currentCol, currentRow ] = destHex
	const [ destCol, destRow ] = startHex
	let distanceAccumulator = 0
	while (currentCol !== destCol || currentRow !== destRow) {
		const isInsetRow = currentRow % 2 === 1
		if (currentRow === destRow) {
			currentCol += currentCol > destCol ? -1 : 1
		} else {
			currentRow += currentRow > destRow ? -1 : 1
			if (currentCol > destCol) {
				if (!isInsetRow) {
					currentCol += -1
				}
			} else if (currentCol < destCol) {
				if (isInsetRow) {
					currentCol += 1
				}
			}
		}
		distanceAccumulator += 1
	}
	return distanceAccumulator
}

export function getBestHexWithinRangeTo(target: ChampionUnit, maxHexRange: number, possibleHexes: HexCoord[]): HexCoord | undefined {
	return getBestRandomAsMax(true, possibleHexes, (hex) => {
		const outOfRange = target.hexDistanceTo(hex) > maxHexRange
		return coordinateDistanceSquared(target.coord, getCoordFrom(hex)) * (outOfRange ? -1 : 1)
	})
}

export function recursivePathTo(originHex: HexCoord, destHex: HexCoord, occupiedHexes: HexCoord[], fromHexes: HexCoord[], checkedHexes: HexCoord[]): HexCoord | undefined {
	const newSearchHexes: HexCoord[] = []
	for (const fromHex of fromHexes) {
		for (const surroundingHex of getHexRing(fromHex)) {
			if (isSameHex(surroundingHex, originHex)) {
				return fromHex
			}
			if (containsHex(surroundingHex, checkedHexes)) {
				continue
			}
			checkedHexes.push(surroundingHex)
			if (!containsHex(surroundingHex, occupiedHexes)) {
				newSearchHexes.push(surroundingHex)
			}
		}
	}
	return !newSearchHexes.length ? undefined : recursivePathTo(originHex, destHex, occupiedHexes, newSearchHexes, checkedHexes)
}

export function getDefaultHexFor(teamNumber: TeamNumber): HexCoord {
	return teamNumber === 0 ? [0, setData.rowsTotal - 1] : [BOARD_COL_COUNT - 1, 0]
}
