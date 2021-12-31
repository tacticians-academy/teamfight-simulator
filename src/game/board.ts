import { reactive, readonly } from 'vue'

import type { HexCoord, StarLevel, TeamNumber } from '#/game/types'
import { ChampionUnit } from '#/game/unit'
import { buildBoard } from '#/game/boardUtils'

interface HexRowCol {
	position: HexCoord
}

const hexRowsCols: HexRowCol[][] = buildBoard(true)

export const state = reactive({
	isRunning: false,
	winningTeam: null as TeamNumber | null,
	hexRowsCols,
	hexProportionX: 0,
	hexProportionY: 0,
	units: [] as ChampionUnit[],
	dragUnit: null as ChampionUnit | null,
})

const store = {
	state: state,

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		unit.reset()
	},
	dragUnit(event: DragEvent, unit: ChampionUnit | string) {
		const isNew = typeof unit === 'string'
		const transfer = event.dataTransfer
		if (transfer) {
			transfer.setData('text/type', 'unit')
			transfer.setData('text/name', isNew ? unit : unit.name)
			transfer.effectAllowed = 'copyMove'
		}
		state.dragUnit = isNew ? null : unit
	},
	deleteUnit(position: HexCoord) {
		state.units = state.units.filter(unit => !unit.isStartAt(position))
		state.dragUnit = null
	},
	copyUnit(unit: ChampionUnit, position: HexCoord) {
		store.deleteUnit(position)
		state.units.push(new ChampionUnit(unit.name, position))
		//TODO copy star level, items, etc
		state.dragUnit = null
	},
	moveUnit(unit: ChampionUnit | string, position: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store.deleteUnit(position)
			state.units.push(new ChampionUnit(unit, position))
		} else {
			const existingUnit = state.units.find(unit => unit.isStartAt(position))
			if (existingUnit) {
				existingUnit.reposition(unit.startPosition)
			}
			unit.reposition(position)
		}
		state.dragUnit = null
	},

	gameOver(forTeam: TeamNumber) {
		state.winningTeam = forTeam === 0 ? 1 : 0
	},

	resetGame() {
		for (const unit of state.units) {
			unit.reset()
		}
	},
}

export function useStore() {
	return store
}
