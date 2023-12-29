import { setData } from '#/store/store'

import { BOARD_COL_COUNT } from '#/sim/helpers/constants'
import type { HexCoord, TeamNumber } from '#/sim/helpers/types'

export function getInverseHex(hex: HexCoord): HexCoord {
	return [BOARD_COL_COUNT - hex[0] - 1, setData.rowsTotal - hex[1] - 1]
}
export function getMirrorHex(hex: HexCoord): HexCoord {
	return getTeamFor(hex) === 0 ? hex : getInverseHex(hex)
}

export function getTeamFor(hex: HexCoord | undefined): TeamNumber {
	return hex ? getTeamForRow(hex[1]) : 0
}
export function getTeamForRow(rowIndex: number): TeamNumber {
	return rowIndex >= setData.rowsPerSide ? 0 : 1
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
