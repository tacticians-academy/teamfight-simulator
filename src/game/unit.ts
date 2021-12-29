import { BOARD_ROW_PER_SIDE_COUNT } from '#/game/constants'
import type { HexCoord } from '#/game/types'

export class UnitData {
	name: string
	startPosition: HexCoord = [0, 0]
	activePosition: HexCoord | undefined
	team: 0 | 1 = 0
	dead = false

	constructor(name: string, position: HexCoord) {
		this.name = name
		this.reposition(position)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
	}
	isAt(position: HexCoord) {
		return this.startPosition[0] === position[0] && this.startPosition[1] === position[1]
	}
	currentPosition() {
		return this.activePosition ?? this.startPosition
	}
}
