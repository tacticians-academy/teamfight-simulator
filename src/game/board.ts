import { reactive, readonly } from 'vue'

import { BOARD_COL_COUNT, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT } from '#/game/constants'
import type { HexCoord } from '#/game/types'
import { UnitData } from '#/game/unit'

const hexRowsCols = [...Array(BOARD_ROW_COUNT)].map(row => [...Array(BOARD_COL_COUNT)].map(col => Object()))

const units: UnitData[] = []

export const state = reactive({
	hexRowsCols,
	units,
})

const store = {
	state: state,

	deleteUnit(position: HexCoord) {
		state.units = state.units.filter(unit => !unit.isAt(position))
	},
	replaceUnit(name: string, position: HexCoord) {
		store.deleteUnit(position)
		state.units.push(new UnitData(name, position))
	},
}

export function useStore() {
	return store
}
