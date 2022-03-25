import { containsHex, getHexRing, isSameHex } from '#/helpers/boardUtils'
import type { HexCoord } from '#/helpers/types'

export function recursivePathTo(originHex: HexCoord, destHex: HexCoord, occupiedHexes: HexCoord[], fromHexes: HexCoord[], checkedHexes: HexCoord[]): HexCoord | undefined {
	const newSearchHexes: HexCoord[] = []
	for (const hex of fromHexes) {
		for (const surroundingHex of getHexRing(hex)) {
			if (isSameHex(surroundingHex, originHex)) {
				return hex
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
