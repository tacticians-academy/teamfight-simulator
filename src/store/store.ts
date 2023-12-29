import { computed, reactive, shallowReactive, watch, watchEffect } from 'vue'

import { ItemKey, TraitKey, removeFirstFromArrayWhere, SET_NUMBERS } from '@tacticians-academy/academy-library'
import type { AugmentData, AugmentGroupKey, ChampionData, ItemData, SetNumber, TraitData } from '@tacticians-academy/academy-library'
import { importAugments, importChampions, importItems, importTraits, importSetData } from '@tacticians-academy/academy-library/dist/imports'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6.5/champions'

import { clearBoardStorage, getSavedComps, getSavedUnits, getSetNumber, getStorageInt, getStorageJSON, getStorageString, loadTeamAugments, saveSetNumber, saveTeamAugments, saveUnits, setStorage, setStorageJSON, StorageKey } from '#/store/storage'
import type { AugmentList, StorageChampion } from '#/store/storage'

import { importDefaultComps, importAugmentEffects, importChampionEffects, importItemEffects, importTraitEffects } from '#/sim/data/imports'
import type { AugmentEffects, AugmentFns, ChampionEffects, CustomComp, CustomComps, ItemEffects, TraitEffects } from '#/sim/data/types'

import { ChampionUnit } from '#/sim/ChampionUnit'
import { cancelLoop, delayUntil } from '#/sim/loop'
import type { HexEffect } from '#/sim/effects/HexEffect'
import type { MoveUnitEffect } from '#/sim/effects/MoveUnitEffect'
import type { ProjectileEffect } from '#/sim/effects/ProjectileEffect'
import type { ShapeEffect } from '#/sim/effects/ShapeEffect'
import type { TargetEffect } from '#/sim/effects/TargetEffect'

import { getAdjacentRowUnitsTo } from '#/sim/helpers/board'
import { BOARD_MAX_ROW_COUNT } from '#/sim/helpers/constants'
import { getInverseHex, getMirrorHex, isSameHex } from '#/sim/helpers/hexes'
import { getAliveUnitsOfTeam, getAliveUnitsOfTeamWithTrait, getUnitsOfTeam, getVariables, resetChecks } from '#/sim/helpers/effectUtils'
import { MutantType } from '#/sim/helpers/types'
import type { BonusLabelKey, HexCoord, StarLevel, SynergyData, TeamNumber } from '#/sim/helpers/types'
import { getItemByIdentifier, uniqueIdentifier } from '#/sim/helpers/utils'

import type { DraggableType } from '#/ui/helpers/dragDrop'

type TraitAndUnits = [TraitData, string[]]

export const DEFAULT_SET = SET_NUMBERS[SET_NUMBERS.length - 1]

// State

export const setData = shallowReactive({
	rowsPerSide: BOARD_MAX_ROW_COUNT / 2,
	rowsTotal: BOARD_MAX_ROW_COUNT,

	activeAugments: [] as AugmentData[],
	emptyImplementationAugments: [] as string[],
	champions: [] as ChampionData[],
	traits: [] as TraitData[],
	currentItems: [] as ItemData[],
	completedItems: [] as ItemData[],
	componentItems: [] as ItemData[],
	emblemItems: [] as ItemData[],
	shadowItems: [] as ItemData[],
	radiantItems: [] as ItemData[],
	ornnItems: [] as ItemData[],
	shimmerscaleItems: [] as ItemData[],
	supportItems: [] as ItemData[],
	compsDefault: {} as CustomComps,
	augmentEffects: {} as AugmentEffects,
	championEffects: {} as ChampionEffects,
	itemEffects: {} as ItemEffects,
	traitEffects: {} as TraitEffects,

	levelShopOdds: [[0, 0, 0, 0, 0]] as number[][],
	levelXP: [] as number[],
	unitCostPoolSizes: [] as number[],
})
export const setDataReactive = reactive({
	compsUser: {} as CustomComps,
})

export type SimMode = 'teamfight' | 'rolldown'

const initSetNumber = getSetNumber()
export const state = reactive({
	simMode: 'rolldown' as SimMode, //SAMPLE
	// simMode: 'teamfight' as SimMode,
	loadedSet: false,
	setNumber: initSetNumber,

	gold: 80,
	xp: 78,

	elapsedSeconds: 0,
	didStart: false,
	winningTeam: null as TeamNumber | null,
	units: [] as ChampionUnit[],
	benchUnits: [] as (ChampionUnit | undefined)[],

	hexEffects: new Set<HexEffect>(),
	moveUnitEffects: new Set<MoveUnitEffect>(),
	projectileEffects: new Set<ProjectileEffect>(),
	shapeEffects: new Set<ShapeEffect>(),
	targetEffects: new Set<TargetEffect>(),

	augmentsByTeam: [[null, null, null], [null, null, null]] as [AugmentList, AugmentList],
	socialiteHexes: (getStorageJSON(initSetNumber, StorageKey.SocialiteHexes) ?? [null, null]) as (HexCoord | null)[],
	stageNumber: getStorageInt(initSetNumber, StorageKey.StageNumber, 3),
	mutantType: (getStorageString(initSetNumber, StorageKey.Mutant) as MutantType) ?? MutantType.Cybernetic,

	dragUnit: null as ChampionUnit | null,
})
setSetNumber(initSetNumber)

export async function setSetNumber(set: SetNumber) {
	state.loadedSet = false

	try {
		const { activeAugments, emptyImplementationAugments } = await importAugments(set)
		const { defaultComps } = await importDefaultComps(set)
		const { augmentEffects } = await importAugmentEffects(set)
		const { championEffects } = await importChampionEffects(set)
		const { itemEffects } = await importItemEffects(set)
		const { traitEffects } = await importTraitEffects(set)

		const { champions } = await importChampions(set)
		const { currentItems, completedItems, componentItems, shadowItems, radiantItems, ornnItems, shimmerscaleItems, supportItems, emblemItems } = await importItems(set)
		const { traits } = await importTraits(set)
		const { LEVEL_SHOP_ODDS, LEVEL_XP, UNIT_COST_POOL_SIZES } = await importSetData(set)

		state.augmentsByTeam = loadTeamAugments(set, activeAugments)
		state.socialiteHexes = (getStorageJSON(set, StorageKey.SocialiteHexes) ?? [null, null]) as (HexCoord | null)[]
		state.stageNumber = getStorageInt(set, StorageKey.StageNumber, 3)
		state.mutantType = (getStorageString(set, StorageKey.Mutant) as MutantType) ?? MutantType.Cybernetic

		setData.activeAugments = activeAugments ?? []
		setData.emptyImplementationAugments = emptyImplementationAugments ?? []
		setData.champions = champions ?? []
		setData.currentItems = currentItems
		setData.completedItems = completedItems
		setData.componentItems = componentItems
		setData.emblemItems = emblemItems
		setData.shadowItems = shadowItems
		setData.radiantItems = radiantItems
		setData.ornnItems = ornnItems
		setData.shimmerscaleItems = shimmerscaleItems
		setData.supportItems = supportItems
		setData.traits = traits ?? []
		setData.compsDefault = defaultComps ?? {}
		setDataReactive.compsUser = getSavedComps(set)
		setData.augmentEffects = augmentEffects ?? {}
		setData.championEffects = championEffects ?? {}
		setData.itemEffects = itemEffects ?? {}
		setData.traitEffects = traitEffects ?? {}

		setData.levelShopOdds = LEVEL_SHOP_ODDS ?? []
		setData.levelXP = LEVEL_XP ?? []
		setData.unitCostPoolSizes = UNIT_COST_POOL_SIZES ?? []

		setData.rowsPerSide = set < 2 ? 3 : 4
		setData.rowsTotal = setData.rowsPerSide * 2

		state.setNumber = set
		state.units = []
		state.benchUnits = []
		loadStorageUnits(getSavedUnits(state.setNumber))
		saveSetNumber(set)

		if (set === DEFAULT_SET) { // Load sample data first run
			const latestVersion = '2'
			if (window.localStorage.getItem('TFTSIM_v') !== latestVersion) {
				window.localStorage.setItem('TFTSIM_v', latestVersion)
				const comps = Object.values(setData.compsDefault)
				if (comps.length >= 2) {
					setCompForTeam(comps[0], 0)
					setCompForTeam(comps[1], 1)
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
	state.loadedSet = true
}

// Getters

export const getters = {
	augmentCount: computed(() => Math.min(3, state.stageNumber - 1)),
	mutantType: computed(() => state.mutantType),

	currentLevelData: computed(() => {
		if (state.xp <= 0 || !setData.levelXP.length) {
			return [0, 0, 0]
		}
		const currentLevelIndex = setData.levelXP.findIndex(levelXP => levelXP > state.xp) - 1
		const currentLevelXP = setData.levelXP[currentLevelIndex]
		const nextLevelXP = setData.levelXP[currentLevelIndex + 1]
		return [currentLevelIndex + 1, state.xp - currentLevelXP, nextLevelXP - currentLevelXP]
	}),

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
				if (!entry[1].includes(unit.data.apiName)) {
					entry[1].push(unit.data.apiName)
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

watch(getters.mutantType, (mutantType) => {
	setStorage(state.setNumber, StorageKey.Mutant, mutantType)
	resetUnitsAfterUpdating()
})
watchEffect(() => {
	setStorage(state.setNumber, StorageKey.StageNumber, state.stageNumber)
})
watch(getters.augmentCount, (augmentCount) => {
	state.augmentsByTeam.forEach(teamAugments => {
		teamAugments.forEach((augment, index) => {
			if (index >= augmentCount) {
				teamAugments[index] = null
			}
		})
	})
	resetUnitsAfterUpdating()
})

// Store

export function getValueOfTeam(teamNumber: TeamNumber) {
	return getUnitsOfTeam(teamNumber).map(u => u.getTotalValue()).reduce((curr, acc) => curr + acc, 0)
}

export function clearBoardStateAndReset() {
	clearBoardStorage(state.setNumber)
	state.units = []
	state.augmentsByTeam.forEach(augments => augments.forEach((augment, index) => augments[index] = null))
	resetUnitsAfterUpdating()
}

export function resetUnitsAfterUpdating() {
	resetChecks()
	const synergiesByTeam = getters.synergiesByTeam.value
	state.units = state.units.filter(unit => {
		if (unit.wasSpawnedDuringFight) {
			return false
		}
		if (!unit.isStarLocked) {
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
		const startHex = unit.startHex
		if (!startHex) return

		unit.items.forEach((item, index) => {
			const itemEffect = setData.itemEffects[item.name]
			if (itemEffect) {
				itemEffect.apply?.(item, unit)
				if (itemEffect.adjacentHexBuff) {
					const hexRange = item.effects['HexRange']
					if (hexRange != null) {
						itemEffect.adjacentHexBuff(item, unit, getAdjacentRowUnitsTo(hexRange, startHex, state.units))
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

function repositionUnit(unit: ChampionUnit, hex: HexCoord | undefined, benchIndex: number | undefined) {
	if (hex) {
		if (unit.startHex && isSameHex(unit.startHex, hex)) return

		if (unit.benchIndex != null) {
			if (state.benchUnits[unit.benchIndex] === unit) {
				state.benchUnits[unit.benchIndex] = undefined
			}
			unit.benchIndex = undefined
			state.units.push(unit)
		}
		unit.startHex = [...hex]
	} else if (benchIndex != null) {
		if (unit.startHex) {
			removeFirstFromArrayWhere(state.units, (u) => u === unit)
			unit.startHex = undefined
		}
		if (unit.benchIndex != null && state.benchUnits[unit.benchIndex] === unit) {
			state.benchUnits[unit.benchIndex] = undefined
		}
		state.benchUnits[benchIndex] = unit
		unit.benchIndex = benchIndex
	}
	unit.updateTeam()
}

const store = {
	state,

	getters,

	setStarLevel(unit: ChampionUnit, starLevel: StarLevel) {
		unit.starLevel = starLevel
		resetUnitsAfterUpdating()
		saveUnits(state.setNumber)
	},
	_deleteItem(itemName: string, fromUnit: ChampionUnit) {
		fromUnit.items.forEach((item, index) => {
			const key = uniqueIdentifier(index, item) as BonusLabelKey
			delete fromUnit.stacks[key]
		})
		removeFirstFromArrayWhere(fromUnit.items, (item) => item.name === itemName)
	},
	deleteItem(itemName: string, fromUnit: ChampionUnit) {
		state.dragUnit = null
		store._deleteItem(itemName, fromUnit)
		fromUnit.genericReset()
		saveUnits(state.setNumber)
		resetUnitsAfterUpdating()
	},
	_addItem(item: ItemData, champion: ChampionUnit) {
		if (champion.data.isSpawn) {
			let canSpawnHoldItems = false
			if (champion.data.apiName === ChampionKey.TrainingDummy) {
				if (state.setNumber >= 9) {
					if (state.setNumber < 10) {
						canSpawnHoldItems = getItemByIdentifier(item.apiName ?? item.id, setData.emblemItems) != null
					} else {
						canSpawnHoldItems = true
					}
				}
			}
			if (!canSpawnHoldItems) {
				console.log(champion.data.name, 'cannot hold', item.name)
				return false
			}
		}
		if (item.unique && champion.items.some(existingItem => existingItem.name === item.name)) {
			console.log('Unique item per champion', item.name)
			return false
		}
		if (item.name === ItemKey.BlueBuff && champion.manaMax() <= 0) {
			console.log('Manaless champions cannot hold', item.name)
			return false
		}
		if (item.name.endsWith('Emblem')) {
			const emblemTrait = item.name.replace(' Emblem', '') as TraitKey
			if (!setData.traits.some(trait => trait.name === emblemTrait)) {
				console.log('ERR: No trait for emblem', item)
			} else {
				if (champion.hasTrait(emblemTrait)) {
					console.log('Unit already has trait', emblemTrait)
					return false
				}
			}
		}
		if (champion.items.length >= 3) {
			this._deleteItem(champion.items[0].name, champion)
		}
		champion.items.push(item)
		champion.genericReset()
		saveUnits(state.setNumber)
		return true
	},
	addItemName(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (item && store._addItem(item, champion)) {
			resetUnitsAfterUpdating()
			return true
		}
		return false
	},
	copyItem(itemName: string, champion: ChampionUnit) {
		const item = getItemFrom(itemName)
		if (!item) return

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
			transfer.effectAllowed = state.simMode === 'rolldown' ? 'move' : 'copyMove'
		}
		state.dragUnit = dragUnit
		event.stopPropagation()
	},
	_deleteUnit(hex: HexCoord) {
		removeFirstFromArrayWhere(state.units, (unit) => unit.isStartAt(hex))
		state.dragUnit = null
		if (state.simMode !== 'rolldown') {
			saveUnits(state.setNumber)
		}
	},
	deleteUnit(hex: HexCoord) {
		if (state.simMode === 'rolldown') {
			const unit = state.units.find(unit => unit.isStartAt(hex))
			if (unit) {
				state.gold += unit.getSellValue()
			}
		}
		store._deleteUnit(hex)
		resetUnitsAfterUpdating()
	},
	addUnit(apiName: string, hex: HexCoord, starLevel: StarLevel) {
		const unit = new ChampionUnit(apiName, hex, starLevel)
		unit.updateTeam()
		state.units.push(unit)
		unit.genericReset()
		resetUnitsAfterUpdating()
	},
	dropUnit(event: DragEvent, apiName: string, hex: HexCoord | undefined, benchIndex: number | undefined) {
		const dragUnit = state.dragUnit
		if (dragUnit && hex && state.simMode !== 'rolldown' && event.dataTransfer?.effectAllowed === 'copy') {
			store._deleteUnit(hex)
			store.addUnit(apiName, hex, dragUnit.starLevel)
			//TODO copy items?
			state.dragUnit = null
		} else {
			if (dragUnit) {
				const existingUnit = hex ? state.units.find(unit => unit.isStartAt(hex)) : (benchIndex != null ? state.benchUnits[benchIndex] : undefined)
				if (hex && state.simMode === 'rolldown') {
					const increaseMax = dragUnit.benchIndex != null && !existingUnit ? 0 : 1
					if (getUnitsOfTeam(0).length >= getters.currentLevelData.value[0] + increaseMax) {
						return
					}
				}
				if (existingUnit) {
					repositionUnit(existingUnit, dragUnit.startHex, dragUnit.benchIndex)
				}
				repositionUnit(dragUnit, hex, benchIndex)
				resetUnitsAfterUpdating()
				state.dragUnit = null
			} else if (hex) {
				store._deleteUnit(hex)
				store.addUnit(apiName, hex, 1)
			}
		}
		saveUnits(state.setNumber)
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

export function loadStorageUnits(storageUnits: StorageChampion[]) {
	const synergiesByTeam = [[], []]
	const units = storageUnits
		.map(storageUnit => {
			const championItems = storageUnit.items
				.map(id => getItemByIdentifier(id, setData.currentItems))
				.filter((item): item is ItemData => !!item)
			const champion = new ChampionUnit(storageUnit.id, storageUnit.hex, storageUnit.starLevel)
			champion.updateTeam()
			champion.items = championItems
			champion.resetPre(synergiesByTeam)
			if (storageUnit.stacks) {
				for (const [key, amount] of storageUnit.stacks) {
					champion.stacks[key as BonusLabelKey] = {
						amount,
					}
				}
			}
			return champion
		})
	state.units.push(...units)
	resetUnitsAfterUpdating()
}

export function setCompForTeam(comp: CustomComp, teamNumber: TeamNumber) {
	const teamAugments = state.augmentsByTeam[teamNumber]
	teamAugments.forEach((augment, index) => teamAugments[index] = null)
	state.units = state.units.filter(unit => unit.team !== teamNumber)
	if (teamNumber === 1) {
		comp.units.forEach(unit => unit.hex = getInverseHex(unit.hex))
	}
	comp.augments.forEach((augmentName, index) => teamAugments[index] = setData.activeAugments.find(augment => augment.name === augmentName) ?? null)
	loadStorageUnits(comp.units)
	saveUnits(state.setNumber)
	saveTeamAugments(state.setNumber)
}
