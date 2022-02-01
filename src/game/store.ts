import { computed, reactive } from 'vue'

import { items } from '#/data/set6/items'
import { traits } from '#/data/set6/traits'
import type { TraitKey } from '#/data/set6/traits'

import type { DraggableType } from '#/game/dragDrop'
import { ChampionUnit } from '#/game/unit'

import { buildBoard } from '#/helpers/boardUtils'
import { removeFirstFromArray } from '#/helpers/utils'
import type { HexCoord, HexRowCol, ItemData, StarLevel, SynergyCount, SynergyData, TeamNumber } from '#/helpers/types'
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

function getItemFrom(name: string) {
	const item = items.find(item => item.name === name)
	if (!item) {
		console.log('Invalid item', name)
	}
	return item
}

const store = {
	state,

	getters,

	loadUnits() {
		if (!state.units.length) {
			const synergiesByTeam = [[], []]
			const units = getSavedUnits()
				.map(storageChampion => {
					const championItems = storageChampion.items
						.map(itemName => items.find(item => item.name === itemName))
						.filter((item): item is ItemData => !!item)
					const champion = new ChampionUnit(storageChampion.name, storageChampion.position, storageChampion.starLevel, synergiesByTeam)
					champion.items = championItems
					return champion
				})
			state.units.push(...units)
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
		saveUnits()
	},
	addItem(item: ItemData, champion: ChampionUnit) {
		if (!champion.traits.length) {
			console.log('Spawns cannot hold items')
			return false
		}
		if (item.unique && champion.items.find(existingItem => existingItem.name === item.name)) {
			console.log('Unique item per champion', item.name)
			return false
		}
		if (item.name.endsWith('Emblem')) {
			const emblemTrait = item.name.replace(' Emblem', '') as TraitKey
			const trait = traits.find(trait => trait.name === emblemTrait)
			if (!trait) {
				console.log('ERR: No trait for emblem', item)
			} else {
				if (champion.hasTrait(emblemTrait)) {
					console.log('Unit already has trait', emblemTrait)
					return false
				}
			}
		}
		if (champion.items.length >= 3) {
			champion.items.shift()
		}
		champion.items.push(item)
		champion.reset(getters.synergiesByTeam.value)
		saveUnits()
		return true
	},
	addItemName(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		return !!item && store.addItem(item, champion)
	},
	copyItem(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (!item) {
			return
		}
		store.addItem(item, champion)
		state.dragUnit = null
	},
	moveItem(itemName: string, toUnit: ChampionUnit, fromUnit: ChampionUnit | null) {
		if (store.addItemName(itemName, toUnit)) {
			if (fromUnit) {
				store.deleteItem(itemName, fromUnit)
			}
		}
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
				existingUnit.reposition(unit.startPosition, false)
			}
			unit.reposition(position, false)
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
