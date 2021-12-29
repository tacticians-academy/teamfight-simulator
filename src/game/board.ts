import { reactive, readonly } from 'vue'

import { BOARD_COL_COUNT, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT } from '#/game/constants'
import type { HexCoord } from '#/game/types'
import { UnitData } from '#/game/unit'

const hexRowsCols = [...Array(BOARD_ROW_COUNT)].map(row => [...Array(BOARD_COL_COUNT)].map(col => Object()))

export const state = reactive({
	isFighting: false,
	hexRowsCols,
	units: [] as UnitData[],
	dragUnit: null as UnitData | null,
})

const store = {
	state: state,

	dragUnit(event: DragEvent, unit: UnitData | string) {
		const isNew = typeof unit === 'string'
		event.dataTransfer?.setData('text', isNew ? unit : unit.name)
		state.dragUnit = isNew ? null : unit
	},
	deleteUnit(position: HexCoord) {
		state.units = state.units.filter(unit => !unit.isAt(position))
	},
	moveUnit(unit: UnitData | string, position: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store.deleteUnit(position)
			state.units.push(new UnitData(unit, position))
		} else {
			const existingUnit = state.units.find(unit => unit.isAt(position))
			if (existingUnit) {
				existingUnit.reposition(unit.startPosition)
			}
			unit.reposition(position)
		}
		state.dragUnit = null
	},

	resetGame() {
		for (const unit of state.units) {
			unit.activePosition = undefined
		}
	},
}

export function useStore() {
	return store
}
