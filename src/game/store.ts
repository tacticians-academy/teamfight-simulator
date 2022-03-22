import { computed, reactive, ref, watch, watchEffect } from 'vue'

import { removeFirstFromArrayWhere } from '@tacticians-academy/academy-library'
import type { AugmentData, ItemData, TraitData } from '@tacticians-academy/academy-library'

import type { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { currentItems, ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import { traits } from '@tacticians-academy/academy-library/dist/set6/traits'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import augmentEffects from '#/data/set6/augments'
import type { AugmentFns } from '#/data/set6/augments'
import itemEffects from '#/data/items'
import traitEffects from '#/data/set6/traits'

import { ChampionUnit } from '#/game/ChampionUnit'
import type { HexEffect } from '#/game/HexEffect'
import type { ProjectileEffect } from '#/game/ProjectileEffect'
import type { ShapeEffect } from '#/game/ShapeEffect'
import { cancelLoop } from '#/game/loop'

import { getAliveUnitsOfTeamWithTrait } from '#/helpers/abilityUtils'
import { buildBoard, getAdjacentRowUnitsTo, getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import { synergiesByTeam } from '#/helpers/calculate'
import type { DraggableType } from '#/helpers/dragDrop'
import { getSavedUnits, getStorageInt, getStorageJSON, getStorageString, loadTeamAugments, saveTeamAugments, saveUnits, setStorage, setStorageJSON, StorageKey } from '#/helpers/storage'
import { MutantType } from '#/helpers/types'
import type { HexCoord, HexRowCol, StarLevel, SynergyData, TeamNumber } from '#/helpers/types'

type TraitAndUnits = [TraitData, string[]]

// State

const hexRowsCols: HexRowCol[][] = buildBoard(true)

export const state = reactive({
	isRunning: false,
	winningTeam: null as TeamNumber | null,
	hexRowsCols,
	dragUnit: null as ChampionUnit | null,
	units: [] as ChampionUnit[],
	hexEffects: new Set<HexEffect>(),
	projectileEffects: new Set<ProjectileEffect>(),
	shapeEffects: new Set<ShapeEffect>(),

	augmentsByTeam: loadTeamAugments(),

	socialiteHexes: (getStorageJSON(StorageKey.SocialiteHexes) ?? [null, null]) as (HexCoord | null)[],
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
		const traitsAndUnitsByTeam: [TraitAndUnits[], TraitAndUnits[]] = [[], []]
		state.units.forEach(unit => {
			const traitsAndUnits = traitsAndUnitsByTeam[unit.team]
			for (const trait of unit.traits) {
				let entry = traitsAndUnits.find(([teamTrait]) => teamTrait.name === trait.name)
				if (!entry) {
					entry = [trait, []]
					traitsAndUnits.push(entry)
				}
				if (!entry[1].includes(unit.name)) {
					entry[1].push(unit.name)
				}
			}
		})
		state.augmentsByTeam.forEach((augments, teamNumber) => {
			const traitsAndUnits = traitsAndUnitsByTeam[teamNumber]
			augments.forEach(augment => {
				if (!augment) { return }
				const suffix = augment.name.endsWith('Heart') ? 'Heart' : (augment.name.endsWith('Soul') ? 'Soul' : undefined)
				if (!suffix) { return }
				const traitName = augment.name.replace(suffix, '').trim()
				const trait = traits.find(trait => trait.name === traitName)
				if (!trait) { return console.log('ERR', traitName, 'missing augment trait', augment.name) }

				let entry = traitsAndUnits.find(([teamTrait]) => teamTrait.name === traitName)
				if (!entry) {
					entry = [trait, []]
					traitsAndUnits.push(entry)
				}
				if (!entry[1].includes(traitName)) {
					entry[1].push(augment.name)
					if (suffix === 'Soul') {
						entry[1].push(augment.name)
					}
				}
			})
		})
		return traitsAndUnitsByTeam
			.map(teamCountSynergies => {
				return Array.from(teamCountSynergies)
					.map(([trait, uniqueUnits]): SynergyData => {
						const uniqueUnitCount = uniqueUnits.length
						const activeEffect = trait.effects.find(effect => uniqueUnitCount >= effect.minUnits && uniqueUnitCount <= effect.maxUnits)
						return {
							key: trait.name as TraitKey,
							trait,
							activeStyle: activeEffect?.style ?? 0,
							activeEffect,
							uniqueUnitNames: Array.from(uniqueUnits),
						}
					})
					.sort((a, b) => {
						const styleDiff = b.activeStyle - a.activeStyle
						return styleDiff !== 0 ? styleDiff : a.uniqueUnitNames.length - b.uniqueUnitNames.length
					})
			})
	}),

	socialitesByTeam: computed(() => {
		const result: boolean[] = getters.synergiesByTeam.value.map(teamSynergies => teamSynergies.some(synergyData => synergyData.key === TraitKey.Socialite))
		return result
	}),

	activeAugmentEffects: computed(() => {
		return state.augmentsByTeam
			.map(augments => augments.filter((e): e is AugmentData => !!e).map(augment => [augment, augmentEffects[augment.groupID as AugmentGroupKey]] as [AugmentData, AugmentFns]).filter(([augment, effects]) => effects != null))
	}),
}

// Watch

watch([getters.mutantType], () => {
	setStorage(StorageKey.Mutant, state.mutantType)
	resetUnitsAfterUpdating()
})
watchEffect(() => {
	setStorage(StorageKey.StageNumber, state.stageNumber)
})
watch([getters.augmentCount], () => {
	resetUnitsAfterUpdating()
})

// Store

export function clearUnitsAndReset() {
	state.units = []
	resetUnitsAfterUpdating()
}

function resetUnitsAfterUpdating() {
	Object.keys(activatedCheck).forEach(key => delete activatedCheck[key])
	Object.keys(thresholdCheck).forEach(key => delete thresholdCheck[key])
	const _synergiesByTeam = getters.synergiesByTeam.value
	synergiesByTeam[0] = _synergiesByTeam[0]
	synergiesByTeam[1] = _synergiesByTeam[1]
	state.units = state.units.filter(unit => !unit.data.isSpawn || unit.name === ChampionKey.TrainingDummy || synergiesByTeam[unit.team].some(teamSynergy => teamSynergy.activeEffect && teamSynergy.key === TraitKey.Innovator))
	state.hexEffects.clear()
	state.projectileEffects.clear()
	state.shapeEffects.clear()

	state.units.forEach(unit => unit.resetPre(synergiesByTeam))
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
	synergiesByTeam.forEach((teamSynergies, teamNumber) => {
		teamSynergies.forEach(({ key, activeEffect }) => {
			if (!activeEffect) { return }
			const traitEffectFns = traitEffects[key]
			if (!traitEffectFns) { return }
			const traitUnits = getAliveUnitsOfTeamWithTrait(teamNumber as TeamNumber, key)
			if (traitEffectFns.applyForOthers) {
				traitUnits.forEach(unit => traitEffectFns.applyForOthers?.(activeEffect, unit))
			}
			traitEffectFns.onceForTeam?.(activeEffect, teamNumber as TeamNumber, traitUnits)
		})
	})
	state.units.forEach(unit => unit.resetPost())
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
						storageChampion.hex = (storageChampion as any).coord
					}
					return storageChampion.hex != null
				})
				.map(storageChampion => {
					const championItems = storageChampion.items
						.map(itemKey => currentItems.find(item => item.id === itemKey))
						.filter((item): item is ItemData => !!item)
					const champion = new ChampionUnit(storageChampion.name, storageChampion.hex ?? (storageChampion as any).position, storageChampion.starLevel)
					champion.items = championItems
					champion.resetPre(synergiesByTeam)
					return champion
				})
			state.units.push(...units)
		}
		resetUnitsAfterUpdating()
	},

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		resetUnitsAfterUpdating()
		saveUnits()
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		removeFirstFromArrayWhere(fromUnit.items, (item) => item.name === itemName)
		state.dragUnit = null
		fromUnit.genericReset()
		saveUnits()
		resetUnitsAfterUpdating()
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
		champion.genericReset()
		saveUnits()
		return true
	},
	addItemName(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (!!item && store._addItem(item, champion)) {
			resetUnitsAfterUpdating()
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
			resetUnitsAfterUpdating()
		}
		state.dragUnit = null
	},
	moveItem(itemName: string, toUnit: ChampionUnit, fromUnit: ChampionUnit | null) {
		if (store.addItemName(itemName, toUnit)) {
			if (fromUnit) {
				store.deleteItem(itemName, fromUnit)
			} else {
				resetUnitsAfterUpdating()
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
		resetUnitsAfterUpdating()
	},
	addUnit(name: string, hex: HexCoord, starLevel: StarLevel) {
		const unit = new ChampionUnit(name, hex, starLevel)
		state.units.push(unit)
		unit.genericReset()
		resetUnitsAfterUpdating()
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
			resetUnitsAfterUpdating()
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
		resetUnitsAfterUpdating()
	},
}

export function useStore() {
	return store
}

// Helpers

export function getCoordFrom([col, row]: HexCoord): HexCoord {
	// const borderSize = HEX_BORDER_PROPORTION / 100
	// return [(col + 0.5 + (row % 2 === 1 ? 0.5 : 0)) * HEX_PROPORTION + borderSize * (col - 0.5), (row + 1) * HEX_PROPORTION * 0.75 + borderSize * (row - 0.5)]
	return [...state.hexRowsCols[row][col].coord]
}

export function gameOver(forTeam: TeamNumber) {
	state.winningTeam = forTeam === 0 ? 1 : 0
	cancelLoop()
}

export function getSocialiteHexStrength(hex: HexCoord) {
	const mirrorHex = getMirrorHex(hex)
	const socialiteIndex = Object.keys(state.socialiteHexes).map(key => parseInt(key, 10)).find(index => isSameHex(mirrorHex, state.socialiteHexes[index]))
	return socialiteIndex != null ? socialiteIndex + 1 : 0
}

export function setSocialiteHex(index: number, hex: HexCoord | null) {
	if (hex) {
		state.socialiteHexes.forEach((existingSocialiteHex, index) => {
			if (existingSocialiteHex && isSameHex(existingSocialiteHex, hex)) {
				state.socialiteHexes[index] = null
			}
		})
	}
	state.socialiteHexes[index] = hex
	setStorageJSON(StorageKey.SocialiteHexes, state.socialiteHexes)
}

export function setAugmentFor(teamNumber: TeamNumber, augmentIndex: number, augment: AugmentData | null) {
	state.augmentsByTeam[teamNumber][augmentIndex] = augment
	saveTeamAugments()
	resetUnitsAfterUpdating()
}
