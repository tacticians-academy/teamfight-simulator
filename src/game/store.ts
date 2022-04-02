import { computed, reactive, ref, shallowReactive, watch, watchEffect } from 'vue'

import { ChampionKey, ItemKey, TraitKey, removeFirstFromArrayWhere } from '@tacticians-academy/academy-library'
import type { AugmentData, AugmentGroupKey, ChampionData, ItemData, SetNumber, TraitData } from '@tacticians-academy/academy-library'
import { importAugments, importChampions, importItems, importTraits } from '@tacticians-academy/academy-library/dist/imports'

import { importAugmentEffects, importChampionEffects, importItemEffects, importTraitEffects } from '#/data/imports'

import { ChampionUnit } from '#/game/ChampionUnit'
import type { HexEffect } from '#/game/effects/HexEffect'
import type { MoveUnitEffect } from '#/game/effects/MoveUnitEffect'
import type { ProjectileEffect } from '#/game/effects/ProjectileEffect'
import type { ShapeEffect } from '#/game/effects/ShapeEffect'
import type { TargetEffect } from '#/game/effects/TargetEffect'
import { cancelLoop, delayUntil } from '#/game/loop'

import { getAliveUnitsOfTeam, getAliveUnitsOfTeamWithTrait, getVariables, resetChecks } from '#/helpers/abilityUtils'
import { buildBoard, getAdjacentRowUnitsTo, getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import type { DraggableType } from '#/helpers/dragDrop'
import { getSavedUnits, getSetNumber, getStorageInt, getStorageJSON, getStorageString, loadTeamAugments, saveTeamAugments, saveUnits, setStorage, setStorageJSON, StorageKey } from '#/helpers/storage'
import type { AugmentList } from '#/helpers/storage'
import { MutantType } from '#/helpers/types'
import type { AugmentEffects, AugmentFns, HexCoord, HexRowCol, StarLevel, SynergyData, TeamNumber } from '#/helpers/types'
import type { ChampionEffects, ItemEffects, TraitEffects } from '#/helpers/types'

type TraitAndUnits = [TraitData, string[]]

// State

const hexRowsCols: HexRowCol[][] = buildBoard(true)

export const setData = shallowReactive({
	activeAugments: [] as AugmentData[],
	emptyImplementationAugments: [] as string[],
	champions: [] as ChampionData[],
	traits: [] as TraitData[],
	currentItems: [] as ItemData[],
	completedItems: [] as ItemData[],
	componentItems: [] as ItemData[],
	spatulaItems: [] as ItemData[],
	augmentEffects: {} as AugmentEffects,
	championEffects: {} as ChampionEffects,
	itemEffects: {} as ItemEffects,
	traitEffects: {} as TraitEffects,
})

const setNumber = getSetNumber()
export const state = reactive({
	setNumber,
	isLoading: true,
	elapsedSeconds: 0,
	didStart: false,
	winningTeam: null as TeamNumber | null,
	hexRowsCols,
	dragUnit: null as ChampionUnit | null,
	units: [] as ChampionUnit[],
	hexEffects: new Set<HexEffect>(),
	moveUnitEffects: new Set<MoveUnitEffect>(),
	projectileEffects: new Set<ProjectileEffect>(),
	shapeEffects: new Set<ShapeEffect>(),
	targetEffects: new Set<TargetEffect>(),

	augmentsByTeam: [[null, null, null], [null, null, null]] as [AugmentList, AugmentList],
	socialiteHexes: (getStorageJSON(setNumber, StorageKey.SocialiteHexes) ?? [null, null]) as (HexCoord | null)[],
	stageNumber: getStorageInt(setNumber, StorageKey.StageNumber, 3),
	mutantType: (getStorageString(setNumber, StorageKey.Mutant) as MutantType) ?? MutantType.Cybernetic,
})
setSetNumber(setNumber)

export async function setSetNumber(set: SetNumber) {
	state.isLoading = true
	const { activeAugments, emptyImplementationAugments } = await importAugments(set)
	const { augmentEffects } = await importAugmentEffects(set)
	const { championEffects } = await importChampionEffects(set)
	const { itemEffects } = await importItemEffects(set)
	const { traitEffects } = await importTraitEffects(set)

	const { champions } = await importChampions(set)
	const { currentItems, completedItems, componentItems, spatulaItems } = await importItems(set)
	const { traits } = await importTraits(set)

	state.augmentsByTeam = loadTeamAugments(set, activeAugments)
	state.socialiteHexes = (getStorageJSON(set, StorageKey.SocialiteHexes) ?? [null, null]) as (HexCoord | null)[]
	state.stageNumber = getStorageInt(set, StorageKey.StageNumber, 3)
	state.mutantType = (getStorageString(set, StorageKey.Mutant) as MutantType) ?? MutantType.Cybernetic

	setData.activeAugments = activeAugments ?? []
	setData.emptyImplementationAugments = emptyImplementationAugments ?? []
	setData.champions = champions ?? []
	setData.currentItems = currentItems ?? []
	setData.completedItems = completedItems ?? []
	setData.componentItems = componentItems ?? []
	setData.spatulaItems = spatulaItems ?? []
	setData.traits = traits ?? []
	setData.augmentEffects = augmentEffects ?? {}
	setData.championEffects = championEffects ?? {}
	setData.itemEffects = itemEffects ?? {}
	setData.traitEffects = traitEffects ?? {}
	state.setNumber = set
	loadUnits()
	state.isLoading = false
}

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
				const trait = setData.traits.find(trait => trait.name === traitName)
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

	activeAugmentEffectsByTeam: computed(() => {
		return state.augmentsByTeam
			.map(augments => augments.filter((e): e is AugmentData => !!e).map(augment => [augment, setData.augmentEffects[augment.groupID as AugmentGroupKey]] as [AugmentData, AugmentFns]).filter(([augment, effects]) => effects != null))
	}),
}

// Watch

watch([getters.mutantType], () => {
	setStorage(state.setNumber, StorageKey.Mutant, state.mutantType)
	resetUnitsAfterUpdating()
})
watchEffect(() => {
	setStorage(state.setNumber, StorageKey.StageNumber, state.stageNumber)
})
watch([getters.augmentCount], () => {
	resetUnitsAfterUpdating()
})

// Store

export function clearBoardStateAndReset() {
	state.units = []
	state.augmentsByTeam.forEach(augments => augments.forEach((augment, index) => augments[index] = null))
	resetUnitsAfterUpdating()
}

function resetUnitsAfterUpdating() {
	resetChecks()
	const synergiesByTeam = getters.synergiesByTeam.value
	state.units = state.units.filter(unit => {
		if (unit.wasSpawnedDuringFight) {
			return false
		}
		if (!unit.data.isSpawn || unit.name === ChampionKey.TrainingDummy) {
			return true
		}
		return synergiesByTeam[unit.team].some(({ activeEffect, key }) => activeEffect && setData.traitEffects[key]?.shouldKeepSpawn?.(unit))
	})
	state.hexEffects.clear()
	state.moveUnitEffects.clear()
	state.projectileEffects.clear()
	state.shapeEffects.clear()
	state.targetEffects.clear()

	const unitsByTeam: [ChampionUnit[], ChampionUnit[]] = [[], []]
	state.units.forEach(unit => {
		unitsByTeam[unit.team].push(unit)
		unit.resetPre(synergiesByTeam)
	})

	state.units.forEach(unit => {
		unit.items.forEach((item, index) => {
			const itemEffect = setData.itemEffects[item.name]
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
			const traitEffectFns = setData.traitEffects[key]
			if (!traitEffectFns) { return }
			const traitUnits = getAliveUnitsOfTeamWithTrait(teamNumber as TeamNumber, key)
			if (traitEffectFns.applyForOthers) {
				traitUnits.forEach(unit => traitEffectFns.applyForOthers?.(activeEffect, unit))
			}
			traitEffectFns.onceForTeam?.(activeEffect, teamNumber as TeamNumber, traitUnits)
		})
	})

	unitsByTeam.forEach((units, team) => {
		getters.activeAugmentEffectsByTeam.value[team].forEach(([augment, effects]) => {
			effects.apply?.(augment, team as TeamNumber, units)
			if (effects.delayed != null) {
				const [delaySeconds] = getVariables(augment, 'Delay')
				const teamNumber = team as TeamNumber
				delayUntil(0, delaySeconds).then(elapsedMS => effects.delayed?.(augment, elapsedMS, teamNumber, getAliveUnitsOfTeam(teamNumber)))
			}
		})
	})

	state.units.forEach(unit => unit.resetPost())
}

function getItemFrom(name: string) {
	const item = setData.currentItems.find(item => item.name === name)
	if (!item) {
		console.log('Invalid item', name)
	}
	return item
}

const store = {
	state,

	getters,

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		resetUnitsAfterUpdating()
		saveUnits(state.setNumber)
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		removeFirstFromArrayWhere(fromUnit.items, (item) => item.name === itemName)
		state.dragUnit = null
		fromUnit.genericReset()
		saveUnits(state.setNumber)
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
		if (item.name === ItemKey.BlueBuff && champion.manaMax() <= 0) {
			console.log('Manaless champions cannot hold', item.name)
			return false
		}
		if (item.name.endsWith('Emblem')) {
			const emblemTrait = item.name.replace(' Emblem', '') as TraitKey
			const trait = setData.traits.find(trait => trait.name === emblemTrait)
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
		saveUnits(state.setNumber)
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
		saveUnits(state.setNumber)
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
		state.elapsedSeconds = 0
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
	setStorageJSON(state.setNumber, StorageKey.SocialiteHexes, state.socialiteHexes)
}

export function setAugmentFor(teamNumber: TeamNumber, augmentIndex: number, augment: AugmentData | null) {
	state.augmentsByTeam[teamNumber][augmentIndex] = augment
	saveTeamAugments(state.setNumber)
	resetUnitsAfterUpdating()
}

function loadUnits() {
	const synergiesByTeam = [[], []]
	const units = getSavedUnits(state.setNumber)
		.map(storageChampion => {
			const championItems = storageChampion.items
				.map(id => setData.currentItems.find(item => item.id === id))
				.filter((item): item is ItemData => !!item)
			const champion = new ChampionUnit(storageChampion.name, storageChampion.hex, storageChampion.starLevel)
			champion.items = championItems
			champion.resetPre(synergiesByTeam)
			return champion
		})
	state.units = units
	resetUnitsAfterUpdating()
}
