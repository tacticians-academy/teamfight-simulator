import { computed, reactive } from 'vue'

import { items } from '#/data/set6/items'

import type { DraggableType } from '#/game/dragDrop'
import { ChampionUnit } from '#/game/unit'

import { buildBoard } from '#/helpers/boardUtils'
import { removeFirstFromArray } from '#/helpers/utils'
import type { HexCoord, HexRowCol, StarLevel, SynergyCount, SynergyData, TeamNumber } from '#/helpers/types'
import { getSavedUnits, saveUnits } from '#/helpers/storage'

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

const getters = {
	synergiesByTeam: computed(() => {
		const teamSynergies: [SynergyCount, SynergyCount] = [new Map(), new Map()]
		state.units.forEach(unit => {
			const team = teamSynergies[unit.team]
			for (const trait of unit.traits) {
				if (!team.has(trait)) {
					team.set(trait, [unit.name])
				} else {
					const teamTrait = team.get(trait)
					if (teamTrait && !teamTrait.includes(unit.name)) {
						teamTrait.push(unit.name)
					}
				}
			}
		})
		return teamSynergies
			.map(team => team.entries())
			.map(teamCountSynergies => {
				return Array.from(teamCountSynergies)
					.map((countSynergy): SynergyData => {
						const uniqueUnitCount = countSynergy[1].length
						const trait = countSynergy[0]
						const currentEffect = trait.effects.find(effect => uniqueUnitCount >= effect.minUnits && uniqueUnitCount <= effect.maxUnits)
						return [trait, currentEffect?.style ?? 0, currentEffect, Array.from(countSynergy[1])]
					})
					.sort((a, b) => {
						const styleDiff = b[1] - a[1]
						return styleDiff !== 0 ? styleDiff : a[3].length - b[3].length
					})
			})
	}),
}

function resetUnitsAfterCreatingOrMoving() {
	const synergiesByTeam = getters.synergiesByTeam.value
	state.units.forEach(unit => unit.reset(synergiesByTeam))
}

const store = {
	state,

	getters,

	loadUnits() {
		if (!state.units.length) {
			const synergiesByTeam = [[], []]
			state.units.push(...getSavedUnits().map(unit => new ChampionUnit(unit.name, unit.position, unit.starLevel, synergiesByTeam)))
		}
		resetUnitsAfterCreatingOrMoving()
	},

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		unit.reset(getters.synergiesByTeam.value)
		saveUnits()
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		removeFirstFromArray(fromUnit.items, (item) => item.name === itemName)
		state.dragUnit = null
		fromUnit.reset(getters.synergiesByTeam.value)
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
		unit.reset(getters.synergiesByTeam.value)
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
		saveUnits()
		resetUnitsAfterCreatingOrMoving()
	},
	copyUnit(unit: ChampionUnit, position: HexCoord) {
		store.deleteUnit(position)
		state.units.push(new ChampionUnit(unit.name, position, unit.starLevel, getters.synergiesByTeam.value))
		//TODO copy star level, items, etc
		state.dragUnit = null
		resetUnitsAfterCreatingOrMoving()
	},
	moveUnit(unit: ChampionUnit | string, position: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store.deleteUnit(position)
			state.units.push(new ChampionUnit(unit, position, 1, getters.synergiesByTeam.value))
		} else {
			const existingUnit = state.units.find(unit => unit.isStartAt(position))
			if (existingUnit) {
				existingUnit.reposition(unit.startPosition)
			}
			unit.reposition(position)
		}
		state.dragUnit = null
		resetUnitsAfterCreatingOrMoving()
	},
	dropUnit(event: DragEvent, name: string, hex: HexCoord) {
		if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
			store.copyUnit(state.dragUnit, hex)
		} else {
			store.moveUnit(state.dragUnit ?? name, hex)
		}
	},

	gameOver(forTeam: TeamNumber) {
		state.winningTeam = forTeam === 0 ? 1 : 0
	},

	resetGame() {
		const synergiesByTeam = getters.synergiesByTeam.value
		for (const unit of state.units) {
			unit.reset(synergiesByTeam)
		}
	},
}

export function useStore() {
	return store
}
