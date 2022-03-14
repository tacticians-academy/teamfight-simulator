import { computed, reactive, ref, watch, watchEffect } from 'vue'

import { removeFirstFromArrayWhere } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import { currentItems, ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import { traits } from '@tacticians-academy/academy-library/dist/set6/traits'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import itemEffects from '#/data/items'

import type { DraggableType } from '#/game/dragDrop'
import { ChampionUnit } from '#/game/ChampionUnit'
import type { HexEffect } from '#/game/HexEffect'
import type { Projectile } from '#/game/Projectile'
import { cancelLoop } from '#/game/loop'

import { buildBoard, getAdjacentRowUnitsTo } from '#/helpers/boardUtils'
import { synergiesByTeam } from '#/helpers/bonuses'
import { getSavedUnits, getStorageInt, getStorageString, saveUnits, setStorage, StorageKey } from '#/helpers/storage'
import { MutantType } from '#/helpers/types'
import type { HexCoord, HexRowCol, StarLevel, SynergyCount, SynergyData, TeamNumber } from '#/helpers/types'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

// State

const hexRowsCols: HexRowCol[][] = buildBoard(true)

export const state = reactive({
	isRunning: false,
	winningTeam: null as TeamNumber | null,
	hexRowsCols,
	dragUnit: null as ChampionUnit | null,
	units: [] as ChampionUnit[],
	projectiles: new Set<Projectile>(),
	hexEffects: new Set<HexEffect>(),
	stageNumber: ref(getStorageInt(StorageKey.StageNumber, 3)),
	mutantType: ref((getStorageString(StorageKey.Mutant) as MutantType) ?? MutantType.Cybernetic),
})

export const activatedCheck: Record<string, number | undefined> = {}
export const thresholdCheck: Record<string, number | undefined> = {}

// Getters

export const getters = {
	augmentCount: computed(() => Math.min(3, state.stageNumber - 1)),
	mutantType: computed(() => state.mutantType),

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
					.map(([trait, uniqueUnits]): SynergyData => {
						const uniqueUnitCount = uniqueUnits.length
						const currentEffect = trait.effects.find(effect => uniqueUnitCount >= effect.minUnits && uniqueUnitCount <= effect.maxUnits)
						return [trait, currentEffect?.style ?? 0, currentEffect, Array.from(uniqueUnits)]
					})
					.sort((a, b) => {
						const styleDiff = b[1] - a[1]
						return styleDiff !== 0 ? styleDiff : a[3].length - b[3].length
					})
			})
	}),
}

// Watch

watch([getters.mutantType], () => {
	setStorage(StorageKey.Mutant, state.mutantType)
	resetUnitsAfterCreatingOrMoving()
})
watchEffect(() => {
	setStorage(StorageKey.StageNumber, state.stageNumber)
})
watch([getters.augmentCount], () => {
	resetUnitsAfterCreatingOrMoving()
})

// Store

function resetUnitsAfterCreatingOrMoving() {
	Object.keys(activatedCheck).forEach(key => delete activatedCheck[key])
	Object.keys(thresholdCheck).forEach(key => delete thresholdCheck[key])
	state.units = state.units.filter(unit => unit.name !== ChampionKey.VoidSpawn)

	const _synergiesByTeam = getters.synergiesByTeam.value
	synergiesByTeam[0] = _synergiesByTeam[0]
	synergiesByTeam[1] = _synergiesByTeam[1]

	state.units.forEach(unit => unit.reset(synergiesByTeam))
	state.units.forEach(unit => {
		unit.items.forEach((item, index) => {
			const itemEffect = itemEffects[item.id as ItemKey]
			if (itemEffect) {
				itemEffect.apply?.(item, unit)
				if (itemEffect.adjacentHexBuff) {
					const hexRange = item.effects['HexRange']
					if (hexRange != null) {
						itemEffect.adjacentHexBuff(item, unit, getAdjacentRowUnitsTo(hexRange, unit.startHex, state.units))
					} else {
						console.log('ERR', 'adjacentHexBuff', item.name, item.effects)
					}
				}
			}
		})
	})
}

function getItemFrom(name: string) {
	const item = currentItems.find(item => item.name === name)
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
				.filter(storageChampion => { //TODO remove
					if (storageChampion.hex == null) {
						storageChampion.hex = (storageChampion as any).position
					}
					return storageChampion.hex != null
				})
				.map(storageChampion => {
					const championItems = storageChampion.items
						.map(itemKey => currentItems.find(item => item.id === itemKey))
						.filter((item): item is ItemData => !!item)
					const champion = new ChampionUnit(storageChampion.name, storageChampion.hex ?? (storageChampion as any).position, storageChampion.starLevel)
					champion.items = championItems
					champion.reset(synergiesByTeam)
					return champion
				})
			state.units.push(...units)
		}
		resetUnitsAfterCreatingOrMoving()
	},

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		resetUnitsAfterCreatingOrMoving()
		saveUnits()
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		removeFirstFromArrayWhere(fromUnit.items, (item) => item.name === itemName)
		state.dragUnit = null
		fromUnit.reset(getters.synergiesByTeam.value)
		saveUnits()
		resetUnitsAfterCreatingOrMoving()
	},
	_addItem(item: ItemData, champion: ChampionUnit) {
		if (!champion.traits.length) {
			console.log('Spawns cannot hold items')
			return false
		}
		if (item.unique && champion.items.find(existingItem => existingItem.name === item.name) != null) {
			console.log('Unique item per champion', item.name)
			return false
		}
		if (item.id === ItemKey.BlueBuff && champion.manaMax() <= 0) {
			console.log('Manaless champions cannot hold', item.name)
			return false
		}
		if (item.name.endsWith('Emblem')) {
			const emblemTrait = item.name.replace(' Emblem', '') as TraitKey
			const trait = traits.find(trait => trait.name === emblemTrait)
			if (trait == null) {
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
		saveUnits()
		return true
	},
	addItemName(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (!!item && store._addItem(item, champion)) {
			resetUnitsAfterCreatingOrMoving()
			return true
		}
		return false
	},
	copyItem(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (!item) {
			return
		}
		if (store._addItem(item, champion)) {
			resetUnitsAfterCreatingOrMoving()
		}
		state.dragUnit = null
	},
	moveItem(itemName: string, toUnit: ChampionUnit, fromUnit: ChampionUnit | null) {
		if (store.addItemName(itemName, toUnit)) {
			if (fromUnit) {
				store.deleteItem(itemName, fromUnit)
			} else {
				resetUnitsAfterCreatingOrMoving()
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
	_deleteUnit(hex: HexCoord) {
		removeFirstFromArrayWhere(state.units, (unit) => unit.isStartAt(hex))
		state.dragUnit = null
		saveUnits()
	},
	deleteUnit(hex: HexCoord) {
		store._deleteUnit(hex)
		resetUnitsAfterCreatingOrMoving()
	},
	addUnit(name: string, hex: HexCoord, starLevel: StarLevel) {
		const unit = new ChampionUnit(name, hex, starLevel)
		state.units.push(unit)
		resetUnitsAfterCreatingOrMoving()
		resetUnitsAfterCreatingOrMoving() //TODO fix need to call twice (one pass doesn't apply new traits to all units)
	},
	copyUnit(unit: ChampionUnit, hex: HexCoord) {
		store._deleteUnit(hex)
		store.addUnit(unit.name, hex, unit.starLevel)
		//TODO copy star level, items, etc
		state.dragUnit = null
	},
	moveUnit(unit: ChampionUnit | string, hex: HexCoord) {
		const isNew = typeof unit === 'string'
		if (isNew) {
			store._deleteUnit(hex)
			store.addUnit(unit, hex, 1)
		} else {
			const existingUnit = state.units.find(unit => unit.isStartAt(hex))
			if (existingUnit) {
				existingUnit.reposition(unit.startHex)
			}
			unit.reposition(hex)
			resetUnitsAfterCreatingOrMoving()
		}
		state.dragUnit = null
	},
	dropUnit(event: DragEvent, name: string, hex: HexCoord) {
		if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
			store.copyUnit(state.dragUnit, hex)
		} else {
			store.moveUnit(state.dragUnit ?? name, hex)
		}
	},

	resetGame() {
		state.projectiles = new Set()
		resetUnitsAfterCreatingOrMoving()
	},
}

export function useStore() {
	return store
}

// Helpers

export function coordinatePosition([col, row]: HexCoord) {
	return state.hexRowsCols[row][col].position
}

export function gameOver(forTeam: TeamNumber) {
	state.winningTeam = forTeam === 0 ? 1 : 0
	state.hexEffects.clear()
	cancelLoop()
}
