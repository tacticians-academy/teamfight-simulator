import type { ChampionUnit } from '#/game/ChampionUnit'

import { doesLineInterceptCircle } from '#/helpers/angles'
import { getBestRandomAsMax, getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { BOARD_COL_COUNT, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT, HEX_PROPORTION, MAX_HEX_COUNT } from '#/helpers/constants'
import type { HexCoord, HexRowCol, TeamNumber } from '#/helpers/types'

const lastCol = BOARD_COL_COUNT - 1
const lastRow = BOARD_ROW_COUNT - 1

export function buildBoard(fillObjects: boolean): any[][] {
	return [...Array(BOARD_ROW_COUNT)].map((row, rowIndex) => [...Array(BOARD_COL_COUNT)].map((col, colIndex) => (fillObjects ? { hex: [colIndex, rowIndex] } : 0)))
}

export function getClosestHexAvailableTo(startHex: HexCoord, units: ChampionUnit[]) {
	const unitHexes = units.filter(unit => unit.hasCollision()).map(unit => unit.activeHex)
	for (let distance = 0; distance <= 4; distance += 1) { //TODO recurse to unlimited distance
		for (const checkHex of getHexRing(startHex, distance)) {
			if (!containsHex(checkHex, unitHexes)) {
				return checkHex
			}
		}
	}
	console.error('No available hex', startHex, unitHexes)
}

export function getDistanceUnitOfTeamWithinRangeTo(isMaximum: boolean, target: ChampionUnit | HexCoord, teamNumber: TeamNumber | null, maxHexDistance: number | undefined, units?: ChampionUnit[]) {
	if (!units) {
		units = getInteractableUnitsOfTeam(teamNumber)
	} else {
		units = units.filter(unit => (teamNumber == null || unit.team === teamNumber) && unit.isInteractable())
	}
	return getBestRandomAsMax(isMaximum, units, (unit) => {
		console.log(unit.name, unit.hexDistanceTo(target), maxHexDistance)
		return maxHexDistance != null && unit.hexDistanceTo(target) > maxHexDistance ? undefined : unit.coordDistanceSquaredTo(target)
	})
}

export function getAdjacentRowUnitsTo(maxDistance: number, targetHex: HexCoord, units: ChampionUnit[]) {
	const [targetCol, targetRow] = targetHex
	return units
		.filter(unit => {
			const [unitCol, unitRow] = unit.startHex
			return unitRow === targetRow && unitCol !== targetCol && Math.abs(targetCol - unitCol) <= maxDistance
		})
}

export function isInBackLines(unit: ChampionUnit) {
	const row = unit.activeHex[1]
	return row <= 1 || row >= lastRow - 1
}

export function getInverseHex(hex: HexCoord): HexCoord {
	return [BOARD_COL_COUNT - hex[0] - 1, BOARD_ROW_COUNT - hex[1] - 1]
}
export function getMirrorHex(hex: HexCoord): HexCoord {
	return hex[1] >= BOARD_ROW_PER_SIDE_COUNT ? getInverseHex(hex) : hex
}

const surroundings = [
	[[1, 0], [0, 1], [-1, 1]],
	[[2, 0], [1, 1], [1, 2], [0, 2], [-1, 2], [-2, 1]],
	[[3, 0], [2, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 3], [-2, 2], [-3, 1]],
	[[4, 0], [3, 1], [3, 2], [2, 3], [2, 4], [1, 4], [0, 4], [-1, 4], [-2, 4], [-3, 3], [-3, 2], [-4, 1]],
]

export function getSurroundingWithin(hex: HexCoord, maxDistance: number, includingOrigin: boolean): HexCoord[] {
	const results: HexCoord[] = []
	for (let distance = 1; distance <= maxDistance; distance += 1) {
		results.push(...getHexRing(hex, distance))
	}
	if (includingOrigin) {
		results.push(hex)
	}
	return results
}

export function getHexRing([col, row]: HexCoord, atDistance: number = 1): HexCoord[] {
	if (atDistance < 1) {
		return [[col, row]]
	}
	const isOffsetRow = row % 2 === 1
	const validHexes: HexCoord[] = []
	for (let mirror = 0; mirror < 2; mirror += 1) {
		const rowMultiplier = mirror === 0 ? 1 : -1
		for (const [colDelta, rowDelta] of surroundings[atDistance - 1]) {
			const isCheckOffsetFromRow = isOffsetRow && rowDelta % 2 !== 0
			const colMultiplier = rowDelta === 0 ? rowMultiplier : 1
			const newCol = col + (colDelta + (isCheckOffsetFromRow ? 1 : 0)) * colMultiplier
			const newRow = row + rowDelta * rowMultiplier
			if (newCol >= 0 && newCol <= lastCol && newRow >= 0 && newRow <= lastRow) {
				validHexes.push([newCol, newRow])
			}
		}
	}
	return validHexes
}

export function getProjectedHexLineFrom(fromUnit: ChampionUnit, toUnit: ChampionUnit, hexRowsCols: HexRowCol[][]) {
	const fromCoord = fromUnit.coord
	const [projectedX, projectedY] = toUnit.coord
	const dX = (projectedX - fromCoord[0]) * MAX_HEX_COUNT
	const dY = (projectedY - fromCoord[1]) * MAX_HEX_COUNT
	const results: [number, HexCoord][] = []
	hexRowsCols.forEach(row => {
		row.forEach(colRow => {
			if (doesLineInterceptCircle(colRow.coord, HEX_PROPORTION / 2, fromCoord, [dX, dY])) {
				results.push([fromUnit.coordDistanceSquaredTo(colRow), colRow.hex])
			}
		})
	})
	results.sort((a, b) => a[0] - b[0])
	return results.map(entry => entry[1])
}

export function getProjectedHexAtAngleTo(target: ChampionUnit, fromUnit: ChampionUnit, radiansChange: number, atDistance: number, hexRowsCols: HexRowCol[][]) {
	const angle = target.angleTo(fromUnit) + radiansChange
	const [sourceX, sourceY] = fromUnit.coord
	const deltaX = Math.cos(angle) * atDistance
	const deltaY = Math.sin(angle) * atDistance
	console.log(sourceX, sourceY, deltaX, deltaY)
	const idealCoord: HexCoord = [sourceX + deltaX, sourceY + deltaY]
	const allHexRowsCols = hexRowsCols.flatMap(row => row.map(col => col))
	const bestHexRowCol = getBestRandomAsMax(false, allHexRowsCols, (hexRowCol) => coordinateDistanceSquared(hexRowCol.coord, idealCoord))
	// console.log(JSON.stringify(fromUnit.activeHex), JSON.stringify(bestHexRowCol?.hex))
	return bestHexRowCol?.hex
}

export function getHotspotHexes(includingUnderTargetUnit: boolean, units: ChampionUnit[], team: TeamNumber | null, maxDistance: 1 | 2 | 3 | 4) {
	const densityBoard = buildBoard(false)
	let results: HexCoord[] = []
	let densestHexValue = 0
	for (const unit of units) {
		if (team != null && unit.team !== team) {
			continue
		}
		if (!unit.isAttackable()) {
			continue
		}
		for (let distance = (includingUnderTargetUnit ? 0 : 1); distance <= maxDistance; distance += 1) {
			getHexRing(unit.activeHex, distance).forEach(surroundingHex => {
				const [col, row] = surroundingHex
				const newValue = densityBoard[row][col] + maxDistance + 1 - distance
				densityBoard[row][col] = newValue
				if (newValue > densestHexValue) {
					results = [surroundingHex]
					densestHexValue = newValue
				} else if (newValue === densestHexValue) {
					results.push(surroundingHex)
				}
			})
		}
	}
	return results
}

export function isSameHex(a: HexCoord | null, b: HexCoord | null) {
	if (!a || !b) {
		return false
	}
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

export function getFrontBehindHexes(unit: ChampionUnit, inFront: boolean) {
	const [unitCol, unitRow] = unit.activeHex
	const projectingRowDirection = (unit.team === 0 ? 1 : -1) * (inFront ? 1 : -1)
	return getHexRing(unit.startHex).filter(([col, row]) => row - unitRow === projectingRowDirection)
}

export function getClosestAttackableEnemies(unit: ChampionUnit, allUnits: ChampionUnit[], range?: number, minimumUnits: number = 1) {
	return getClosestAttackableOfTeam(unit.opposingTeam(), unit, allUnits, range, minimumUnits)
}

export function getClosestAttackableOfTeam(team: TeamNumber, unit: ChampionUnit, allUnits: ChampionUnit[], range?: number, minimumUnits: number = 1) {
	let currentRange = 0
	if (range == null) {
		range = unit.range()
	}
	let checkHexes = [unit.activeHex]
	const checkedHexes: HexCoord[] = [...checkHexes]
	const enemies: ChampionUnit[] = []
	while (checkHexes.length && enemies.length < minimumUnits) {
		const visitedSurroundingHexes: HexCoord[] = []
		for (const checkHex of checkHexes) {
			for (const surroundingHex of getHexRing(checkHex)) {
				if (!containsHex(surroundingHex, checkedHexes)) {
					checkedHexes.push(surroundingHex)
					visitedSurroundingHexes.push(surroundingHex)
					for (const checkUnit of allUnits) {
						if (checkUnit.isAttackable() && checkUnit.team === team && checkUnit.isAt(surroundingHex)) {
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

export function coordinateDistanceSquared([startX, startY]: HexCoord, [destX, destY]: HexCoord) {
	const diffX = destX - startX
	const diffY = destY - startY
	return diffX * diffX + diffY * diffY
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

export function getTeamName(team: number) {
	return team === 0 ? 'Blue' : 'Red'
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
