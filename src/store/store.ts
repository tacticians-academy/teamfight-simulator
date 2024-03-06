import { computed, reactive, shallowReactive, watch, watchEffect } from 'vue'

import { ItemKey, removeFirstFromArrayWhere, SET_NUMBERS, removeFirstFromArray } from '@tacticians-academy/academy-library'
import type { AugmentData, AugmentGroupKey, TraitKey, ChampionData, ItemData, SetNumber, TraitData, UnitPools } from '@tacticians-academy/academy-library'
import { importAugments, importChampions, importItems, importTraits, importSetData, importMap } from '@tacticians-academy/academy-library/dist/imports'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6.5/champions'

import { clearBoardStorage, getSavedComps, getSavedUnits, getSetNumber, getStorageInt, getStorageJSON, getStorageString, loadTeamAugments, saveSetNumber, saveTeamAugments, saveUnits, setStorage, setStorageJSON, StorageKey } from '#/store/storage'
import type { AugmentList, StorageChampion } from '#/store/storage'

import { importDefaultComps, importAugmentEffects, importChampionEffects, importItemEffects, importTraitEffects } from '#/sim/data/imports'
import type { AugmentEffects, AugmentFns, ChampionEffects, CustomComp, CustomComps, ItemEffects, RolldownConfig, TraitEffects } from '#/sim/data/types'

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
import { getItemByIdentifier, sum, uniqueIdentifier } from '#/sim/helpers/utils'

import type { DraggableType } from '#/ui/helpers/dragDrop'

type TraitAndUnits = [TraitData, Record<string, number>]

type ShopUnit = {
	apiName: string
	groupAPIName: string
	name: string
	countFromPool: number
	baseCost: number
	totalPrice: number
	icon: string
	starLevel: StarLevel
	traits: string[]
	chosenTraits: Record<string, number> | undefined
}

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
	modItems: [] as ItemData[],
	compsDefault: {} as CustomComps,
	rolldownConfigs: [] as RolldownConfig[],
	augmentEffects: {} as AugmentEffects,
	championEffects: {} as ChampionEffects,
	itemEffects: {} as ItemEffects,
	traitEffects: {} as TraitEffects,

	dropRates: {} as Record<string, number[][]>,
	headlinerSystemParameters: {} as Record<string, number> | undefined,
	tierBags: {} as UnitPools,
	levelXP: [] as number[],
	combinePoolAPINames: {} as Record<string, string | undefined>,
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

	rolldownActive: false,
	shop: [null, null, null, null, null] as (ShopUnit | null)[],
	gold: 80,
	xp: 78,
	chosen: null as ChampionUnit | null,
	shopSinceChosen: 0,
	shopNumber: 0,
	shopUnitPools: {} as UnitPools,
	benchItems: [] as ItemData[],

	chosenUnitLastTrait: {} as Record<string, string | undefined>,
	chosenUnitLastShop: {} as Record<string, number | undefined>,
	chosenPreviousTraits: [] as string[],

	elapsedSeconds: 0,
	didStart: false,
	winningTeam: null as TeamNumber | null,
	units: [] as ChampionUnit[],
	benchUnits: Array(9).fill(null) as (ChampionUnit | null)[],

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

// Getters

export const getters = {
	augmentCount: computed(() => Math.min(3, state.stageNumber - 1)),
	mutantType: computed(() => state.mutantType),

	isBoardEnabled: computed(() => state.simMode === 'rolldown' ? state.rolldownActive : !state.didStart),

	currentLevelData: computed(() => {
		if (state.xp <= 0 || !setData.levelXP.length) {
			return [1, 0, 0]
		}
		let currentLevelIndex = setData.levelXP.findIndex(levelXP => levelXP > state.xp)
		if (currentLevelIndex === -1) {
			currentLevelIndex = setData.levelXP.length
		}
		currentLevelIndex -= 1

		const currentLevelXP = setData.levelXP[currentLevelIndex]
		const nextLevelXP = setData.levelXP[currentLevelIndex + 1] ?? 0
		return [currentLevelIndex + 1, state.xp - currentLevelXP, nextLevelXP === 0 ? 0 : nextLevelXP - currentLevelXP]
	}),

	synergiesByTeam: computed(() => {
		const traitsAndUnitsByTeam: [TraitAndUnits[], TraitAndUnits[]] = [[], []]
		state.units.forEach(unit => {
			const traitsAndUnits = traitsAndUnitsByTeam[unit.team]
			for (const trait of unit.traits) {
				let entry = traitsAndUnits.find(([teamTrait]) => teamTrait.name === trait.name)
				if (!entry) {
					entry = [trait, {}]
					traitsAndUnits.push(entry)
				}

				const prevTraitScoreForUnit = entry[1][unit.groupAPIName] ?? 0
				const newTraitScoreForUnit = unit.chosenTraits?.[trait.name] ?? 1
				if (prevTraitScoreForUnit < newTraitScoreForUnit) {
					entry[1][unit.groupAPIName] = newTraitScoreForUnit
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
					entry = [trait, {}]
					traitsAndUnits.push(entry)
				}
				if (!entry[1][traitName]) { // What does this check?
					entry[1][augment.name] = suffix === 'Soul' ? 2 : 1
				}
			})
		})
		return traitsAndUnitsByTeam
			.map(teamCountSynergies => {
				return Array.from(teamCountSynergies)
					.map(([trait, unitScores]): SynergyData => {
						const totalScore = sum(Object.values(unitScores))
						const activeEffect = trait.effects.find(effect => totalScore >= effect.minUnits && totalScore <= effect.maxUnits)
						return {
							key: trait.name as TraitKey,
							trait,
							activeStyle: activeEffect?.style ?? 0,
							activeEffect,
							units: Object.keys(unitScores),
							totalScore,
						}
					})
					.sort((a, b) => {
						const styleDiff = b.activeStyle - a.activeStyle
						return styleDiff !== 0 ? styleDiff : a.totalScore - b.totalScore
					})
			})
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
				state.benchUnits[unit.benchIndex] = null
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
			state.benchUnits[unit.benchIndex] = null
		}
		state.benchUnits[benchIndex] = unit
		unit.benchIndex = benchIndex
	}
	unit.updateTeam()
}

export function moveUnit(unit: ChampionUnit, hex: HexCoord | undefined, benchIndex: number | undefined) {
	repositionUnit(unit, hex, benchIndex)
	resetUnitsAfterUpdating()
}

// Store

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
	deleteItem(itemName: string, fromUnit: ChampionUnit, wasCopied: boolean) {
		if (!wasCopied && state.rolldownActive) {
			const item = getItemFrom(itemName)
			if (item) {
				state.benchItems.push(item)
			}
		}
		state.dragUnit = null
		store._deleteItem(itemName, fromUnit)
		fromUnit.genericReset()
		saveUnits(state.setNumber)
		resetUnitsAfterUpdating()
	},
	_addItem(item: ItemData, champion: ChampionUnit) {
		if (state.simMode === 'rolldown' && champion.items.length >= 3) {
			return false
		}
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
				store.deleteItem(itemName, fromUnit, true)
			} else {
				removeFirstFromArrayWhere(state.benchItems, (item) => item.name === itemName)
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
	deleteUnit(location: HexCoord | number) {
		if (state.simMode === 'rolldown') {
			const unit = typeof location === 'number' ? state.benchUnits[location] : state.units.find(unit => unit.isStartAt(location))
			if (unit) {
				if (state.chosen === unit) {
					state.chosen = null
				}
				state.gold += unit.getSellValue()
				state.benchItems.push(...unit.items)
				if (unit.data.cost != null) {
					modifyPool(unit.data, unit.data.cost, +unit.getCountFromPool())
				}
			}
		}
		if (typeof location === 'number') {
			state.benchUnits[location] = null
		} else {
			store._deleteUnit(location)
			resetUnitsAfterUpdating()
		}
	},
	addUnit(apiName: string, hex: HexCoord | undefined, benchIndex: number | undefined, starLevel: StarLevel, chosenTraits: Record<string, number> | undefined) {
		const unit = new ChampionUnit(apiName, hex, starLevel, chosenTraits)
		if (hex) {
			unit.updateTeam()
			state.units.push(unit)
			unit.genericReset()
			resetUnitsAfterUpdating()
		} else if (benchIndex != null) {
			unit.benchIndex = benchIndex
			state.benchUnits[benchIndex] = unit
		}
	},
	dropUnit(event: DragEvent, apiName: string, hex: HexCoord | undefined, benchIndex: number | undefined) {
		const dragUnit = state.dragUnit
		if (dragUnit && hex && state.simMode !== 'rolldown' && event.dataTransfer?.effectAllowed === 'copy') {
			store._deleteUnit(hex)
			store.addUnit(apiName, hex, undefined, dragUnit.starLevel, undefined)
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
				moveUnit(dragUnit, hex, benchIndex)
				state.dragUnit = null
			} else if (hex) {
				store._deleteUnit(hex)
				store.addUnit(apiName, hex, undefined, 1, undefined)
			}
		}
		saveUnits(state.setNumber)
	},

	resetGame() {
		state.elapsedSeconds = 0
		resetUnitsAfterUpdating()
	},

	canBuy(shopItem: ShopUnit) {
		return state.gold >= shopItem.totalPrice && (shopItem.chosenTraits == null || state.chosen == null)
	},

	buyUnit(shopItem: ShopUnit, shopIndex: number) {
		if (!store.canBuy(shopItem)) return

		const { groupAPIName } = shopItem

		// Buy multiple to star up on full
		const existingCopiesCount = getCopiesOfUnitAt(groupAPIName, shopItem.starLevel).length
		const shopCopyIndices = state.shop.reduce<number[]>((acc, item, index) => (index !== shopIndex && item?.groupAPIName === groupAPIName) ? acc.concat(index) : acc, [])
		const benchIndex = state.benchUnits.findIndex(benchSpace => benchSpace == null)
		let combinesExtraUnits = false
		let extraUnit = null
		if (benchIndex === -1) {
			if (existingCopiesCount > 0) {
				const maxMoneyCount = Math.floor(state.gold / shopItem.totalPrice)
				const maxBuyableCount = Math.min(maxMoneyCount, shopCopyIndices.length)
				if (maxBuyableCount + existingCopiesCount >= 2) {
					combinesExtraUnits = true
					if (existingCopiesCount < 2) {
						extraUnit = buyUnitFromShopAt(shopCopyIndices[0])
					}
				}
			}
			if (!combinesExtraUnits) {
				return
			}
		}

		const newUnit = buyUnitFromShopAt(shopIndex)
		if (!combinesExtraUnits) {
			newUnit.benchIndex = benchIndex
			state.benchUnits[benchIndex] = newUnit
		}

		// Combine 3 copies of unit
		for (let starLevel = 1 as StarLevel; starLevel <= 2; starLevel += 1) {
			const copiesOfUnitAtStarLevel = [...state.units, ...state.benchUnits, ...(combinesExtraUnits ? [newUnit, extraUnit] : [])].filter((unit): unit is ChampionUnit => unit != null && unit.groupAPIName === groupAPIName && unit.starLevel === starLevel)
			if (copiesOfUnitAtStarLevel.length >= 3) {
				const repUnit = copiesOfUnitAtStarLevel.find(unit => unit.chosenTraits) ?? copiesOfUnitAtStarLevel[0]
				removeFirstFromArray(copiesOfUnitAtStarLevel, repUnit)
				copiesOfUnitAtStarLevel.forEach(unit => {
					unit.items.forEach(_item => {
						let moveItem = _item
						if (repUnit.items.length < 3) {
							repUnit.items.push(moveItem)
						} else {
							if (!setData.componentItems.some(cItem => cItem.name === moveItem.name)) {
								const bumpComponent = repUnit.items.find(repItem => setData.componentItems.some(cItem => cItem.name === repItem.name))
								if (bumpComponent) {
									removeFirstFromArray(repUnit.items, bumpComponent)
									repUnit.items.push(moveItem)
									moveItem = bumpComponent
								}
							}
							state.benchItems.push(moveItem)
						}
					})
					if (unit.benchIndex != null) {
						state.benchUnits[unit.benchIndex] = null
					}
					removeFirstFromArray(state.units, unit)
				})
				store.setStarLevel(repUnit, repUnit.starLevel + 1 as StarLevel)
			}
		}
	},

	getSocialiteHexStrength(hex: HexCoord) {
		const mirrorHex = getMirrorHex(hex)
		const socialiteIndex = Object.keys(state.socialiteHexes).map(key => parseInt(key, 10)).find(index => isSameHex(mirrorHex, state.socialiteHexes[index]))
		return socialiteIndex != null ? socialiteIndex + 1 : 0
	},

	setSocialiteHex(index: number, hex: HexCoord | null) {
		if (hex) {
			state.socialiteHexes.forEach((existingSocialiteHex, index) => {
				if (existingSocialiteHex && isSameHex(existingSocialiteHex, hex)) {
					state.socialiteHexes[index] = null
				}
			})
		}
		state.socialiteHexes[index] = hex
		setStorageJSON(state.setNumber, StorageKey.SocialiteHexes, state.socialiteHexes)
	},

	setAugmentFor(teamNumber: TeamNumber, augmentIndex: number, augment: AugmentData | null) {
		state.augmentsByTeam[teamNumber][augmentIndex] = augment
		saveTeamAugments(state.setNumber)
		resetUnitsAfterUpdating()
	},

	setCompForTeam(comp: CustomComp, teamNumber: TeamNumber) {
		const teamAugments = state.augmentsByTeam[teamNumber]
		teamAugments.forEach((augment, index) => teamAugments[index] = null)
		state.units = state.units.filter(unit => unit.team !== teamNumber)
		if (teamNumber === 1) {
			comp.units.forEach(unit => unit.hex = getInverseHex(unit.hex))
		}
		comp.augments.forEach((augmentName, index) => teamAugments[index] = setData.activeAugments.find(augment => augment.name === augmentName) ?? null)
		const newUnits = loadStorageUnits(comp.units)
		saveUnits(state.setNumber)
		saveTeamAugments(state.setNumber)
		if (teamNumber === 0) {
			for (const unit of newUnits) {
				if (unit.data.cost != null) {
					modifyPool(unit.data, unit.data.cost, -unit.getCountFromPool())
				}
			}
		}
	},

	resetShop() {
		resetChosenParameters()
		state.elapsedSeconds = 0
		state.shopSinceChosen = 0
		state.shopNumber = 0
		state.shop.fill(null)
		state.benchUnits.fill(null)
		state.shopUnitPools = structuredClone(setData.tierBags)
	},
}

export async function setSetNumber(set: SetNumber) {
	state.loadedSet = false

	try {
		const { activeAugments, emptyImplementationAugments } = await importAugments(set)
		const { defaultComps, rolldownConfigs } = await importDefaultComps(set)
		const { augmentEffects } = await importAugmentEffects(set)
		const { championEffects } = await importChampionEffects(set)
		const { itemEffects } = await importItemEffects(set)
		const { traitEffects } = await importTraitEffects(set)

		const { champions } = await importChampions(set)
		const { currentItems, completedItems, componentItems, shadowItems, radiantItems, ornnItems, shimmerscaleItems, supportItems, emblemItems, modItems } = await importItems(set)
		const { traits } = await importTraits(set)
		const { LEVEL_XP, COMBINE_POOL_APINAMES } = await importSetData(set)
		const { dropRates, tierBags, headlinerSystemParameters } = await importMap(set)

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
		setData.modItems = modItems
		setData.traits = traits ?? []
		setData.compsDefault = defaultComps ?? {}
		setData.rolldownConfigs = rolldownConfigs ?? [{stage: 4, gold: 100, xp: 78, augments: [], contestedUnits: [], items: [], units: []}]
		setDataReactive.compsUser = getSavedComps(set)
		setData.augmentEffects = augmentEffects ?? {}
		setData.championEffects = championEffects ?? {}
		setData.itemEffects = itemEffects ?? {}
		setData.traitEffects = traitEffects ?? {}

		setData.dropRates = dropRates ?? []
		setData.tierBags = tierBags
		setData.headlinerSystemParameters = headlinerSystemParameters
		setData.levelXP = LEVEL_XP ?? [0, 0, 2, 8, 18, 38, 74, 130, 210, 310]
		setData.combinePoolAPINames = COMBINE_POOL_APINAMES ?? {}

		setData.rowsPerSide = set < 2 ? 3 : 4
		setData.rowsTotal = setData.rowsPerSide * 2

		store.resetShop()
		state.setNumber = set
		state.units = []
		loadStorageUnits(getSavedUnits(state.setNumber))
		saveSetNumber(set)

		if (set === DEFAULT_SET) { // Load sample data first run
			const latestVersion = '2'
			if (window.localStorage.getItem('TFTSIM_v') !== latestVersion) {
				window.localStorage.setItem('TFTSIM_v', latestVersion)
				const comps = Object.values(setData.compsDefault)
				if (comps.length >= 2) {
					store.setCompForTeam(comps[0], 0)
					store.setCompForTeam(comps[1], 1)
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
	state.loadedSet = true
}

// Helpers

function loadStorageUnits(storageUnits: StorageChampion[]) {
	const synergiesByTeam = [[], []]
	const units = storageUnits
		.map(storageUnit => {
			const championItems = storageUnit.items
				.map(id => getItemByIdentifier(id, setData.currentItems))
				.filter((item): item is ItemData => !!item)
			const champion = new ChampionUnit(storageUnit.id, storageUnit.hex, storageUnit.starLevel, storageUnit.chosenTraits)
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
	return units
}

function buyUnitFromShopAt(shopIndex: number) {
	const shopItem = state.shop[shopIndex]!
	state.gold -= shopItem.totalPrice
	state.shop[shopIndex] = null
	modifyPool(shopItem, shopItem.baseCost, -shopItem.countFromPool)
	if (shopItem.chosenTraits) {
		resetChosenParameters()
	}
	return new ChampionUnit(shopItem.apiName, undefined, shopItem.starLevel, shopItem.chosenTraits)
}

export function getOwnedCountOf(groupAPIName: string) {
	return [...state.units, ...state.benchUnits].reduce((acc, unit) => acc + (unit != null && unit.groupAPIName === groupAPIName ? unit.getCountFromPool() : 0), 0)
}
function getCopiesOfUnitAt(groupAPIName: string, starLevel: number) {
	return [...state.units, ...state.benchUnits].filter((unit): unit is ChampionUnit => unit != null && unit.groupAPIName === groupAPIName && unit.starLevel === starLevel)
}

function modifyPool({ apiName }: { apiName: string }, cost: number, vector: number) {
	const poolAPIName = setData.combinePoolAPINames[apiName] ?? apiName
	// console.log(poolAPIName, state.shopUnitPools[cost][poolAPIName], vector) //SAMPLE
	state.shopUnitPools[cost][poolAPIName]! += vector
}

function resetChosenParameters() {
	state.chosenPreviousTraits = []
	state.chosenUnitLastTrait = {}
	state.chosenUnitLastShop = {}
}

export function gameOver(forTeam: TeamNumber) {
	state.winningTeam = forTeam === 0 ? 1 : 0
	cancelLoop()
}

export function useStore() {
	return store
}

setSetNumber(initSetNumber)
