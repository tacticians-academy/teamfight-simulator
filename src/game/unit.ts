import { containsHex, isSameHex } from '#/game/boardUtils'
import { BOARD_ROW_PER_SIDE_COUNT } from '#/game/constants'
import { sniper } from '#/game/data/set6/traits'
import { allUnits } from '#/game/data/set6/units'
import type { HexCoord, UnitStats } from '#/game/types'

export class UnitData {
	name: string
	startPosition: HexCoord = [0, 0]
	activePosition: HexCoord | undefined
	team: 0 | 1 = 0
	dead = false
	starLevel: 0 | 1 | 2 | 3 | 4 = 1
	stats: UnitStats

	constructor(name: string, position: HexCoord) {
		const stats = allUnits.find(unit => unit.name === name)
		if (!stats) {
			console.log('ERR Invalid unit', name)
		}
		this.stats = stats ?? allUnits[0]
		this.name = name
		this.reposition(position)
	}

	isAt(position: HexCoord) {
		return isSameHex(this.currentPosition(), position)
	}
	isStartAt(position: HexCoord) {
		return isSameHex(this.startPosition, position)
	}
	isIn(hexes: HexCoord[]) {
		return containsHex(this.currentPosition(), hexes)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
	}
	currentPosition() {
		return this.activePosition ?? this.startPosition
	}

	range() {
		return this.stats.range + (this.stats.traits.includes(sniper) ? 1 : 0) //TODO items
	}
}
