import { reactive } from 'vue'

import { items } from '#/data/set6/items'

import type { DraggableType } from '#/game/dragDrop'
import { ChampionUnit } from '#/game/unit'

import { buildBoard } from '#/helpers/boardUtils'
import { removeFirstFromArray } from '#/helpers/utils'
import type { HexCoord, HexRowCol, StarLevel, TeamNumber } from '#/helpers/types'
import { saveUnits } from '#/helpers/storage'

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
	state,

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		unit.reset()
		saveUnits()
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		removeFirstFromArray(fromUnit.items, (item) => item.name === itemName)
		state.dragUnit = null
		fromUnit.reset()
	},
	addItem(itemName: string, unit: ChampionUnit) {
		const item = items.find(item => item.name === itemName)
		if (!item) {
			return
		}
		if (unit.items.length >= 3) {
			unit.items.shift()
		}
		unit.items.push(item)
		unit.reset()
	},
	copyItem(itemName: string, unit: ChampionUnit) {
		store.addItem(itemName, unit)
		state.dragUnit = null
	},
	moveItem(itemName: string, toUnit: ChampionUnit, fromUnit: ChampionUnit | null) {
		if (fromUnit) {
			store.deleteItem(itemName, fromUnit)
		}
		store.addItem(itemName, toUnit)
		state.dragUnit = null
	},
	startDragging(event: DragEvent, type: DraggableType, name: string, dragUnit: ChampionUnit | null) {
		const transfer = event.dataTransfer
		if (transfer) {
			transfer.setData('text/type', type)
			transfer.setData('text/name', name)
			transfer.effectAllowed = 'copyMove'
		}
		state.dragUnit = dragUnit
		event.stopPropagation()
	},
	deleteUnit(position: HexCoord) {
		removeFirstFromArray(state.units, (unit) => unit.isStartAt(position))
		state.dragUnit = null
	},
	copyUnit(unit: ChampionUnit, position: HexCoord) {
		store.deleteUnit(position)
		state.units.push(new ChampionUnit(unit.name, position, unit.starLevel))
		//TODO copy star level, items, etc
		state.dragUnit = null
	},
	moveUnit(unit: ChampionUnit | string, position: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store.deleteUnit(position)
			state.units.push(new ChampionUnit(unit, position, 1))
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
