import { reactive, readonly } from 'vue'

import type { HexCoord, StarLevel } from '#/game/types'
import { UnitData } from '#/game/unit'
import { buildBoard } from '#/game/boardUtils'

const hexRowsCols: Object[][] = buildBoard(true)

export const state = reactive({
	isFighting: false,
	hexRowsCols,
	units: [] as UnitData[],
	dragUnit: null as UnitData | null,
})

const store = {
	state: state,

	setStarLevel(unit: UnitData, starLevel: StarLevel) {
		unit.starLevel = starLevel
		unit.reset()
	},
	dragUnit(event: DragEvent, unit: UnitData | string) {
		const isNew = typeof unit === 'string'
		event.dataTransfer?.setData('text', isNew ? unit : unit.name)
		state.dragUnit = isNew ? null : unit
	},
	deleteUnit(position: HexCoord) {
		state.units = state.units.filter(unit => !unit.isStartAt(position))
		state.dragUnit = null
	},
	moveUnit(unit: UnitData | string, position: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store.deleteUnit(position)
			state.units.push(new UnitData(unit, position))
		} else {
			const existingUnit = state.units.find(unit => unit.isStartAt(position))
			if (existingUnit) {
				existingUnit.reposition(unit.startPosition)
			}
			unit.reposition(position)
		}
		state.dragUnit = null
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
