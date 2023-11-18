import { SET_DATA } from '@tacticians-academy/academy-library'
import type { AugmentData, SetNumber } from '@tacticians-academy/academy-library'

import { DEFAULT_SET, setData, setDataReactive, state } from '#/store/store'

import type{ ChampionUnit } from '#/sim/ChampionUnit'
import type { CustomComps } from '#/sim/data/types'
import type { HexCoord, StarLevel } from '#/sim/helpers/types'

export interface StorageChampion {
	id: string
	hex: HexCoord
	starLevel: StarLevel
	items: (number | string)[]
	stacks?: [string, number][]
}

export const enum StorageKey {
	Augments = 'TFTSIM_augments',
	Comps = 'TFTSIM_compsV2',
	Mutant = 'TFTSIM_mutant',
	StageNumber = 'TFTSIM_stage',
	SocialiteHexes = 'TFTSIM_socialites',
	Units = 'TFTSIM_unitsV2',
}

export function getSetNumber(): SetNumber {
	const value = window.localStorage.getItem('TFTSIM_set')
	if (value != null) {
		const float = parseFloat(value) as SetNumber
		if (SET_DATA[float] != null) {
			return float
		}
	}
	return DEFAULT_SET
}

export function saveSetNumber(set: SetNumber) {
	window.localStorage.setItem('TFTSIM_set', set.toString())
}

// Generic

function keyToSet(key: StorageKey, set: SetNumber): string {
	return key.replace('_', set.toString())
}

export function getStorageInt(set: SetNumber, key: StorageKey, defaultValue: number = 0) {
	const value = window.localStorage.getItem(keyToSet(key, set))
	if (value == null) {
		return defaultValue
	}
	const int = parseInt(value, 10)
	return isNaN(int) ? defaultValue : int
}
export function getStorageString(set: SetNumber, key: StorageKey) {
	return window.localStorage.getItem(keyToSet(key, set))
}
export function getStorageJSON(set: SetNumber, key: StorageKey) {
	const raw = window.localStorage.getItem(keyToSet(key, set))
	return raw != null && raw.length ? JSON.parse(raw) : null
}

export function setStorage(set: SetNumber, key: StorageKey, value: Object) {
	return window.localStorage.setItem(keyToSet(key, set), value.toString())
}
export function setStorageJSON(set: SetNumber, key: StorageKey, value: Object) {
	return setStorage(set, key, JSON.stringify(value))
}

export function removeStorage(set: SetNumber, key: StorageKey) {
	window.localStorage.removeItem(keyToSet(key, set))

}

// Augments

export type AugmentList = [AugmentData | null, AugmentData | null, AugmentData | null]

export function saveTeamAugments(set: SetNumber) {
	const output: string[][] = state.augmentsByTeam
		.map(augments => augments.map(augment => augment?.name ?? ''))
	window.localStorage.setItem(keyToSet(StorageKey.Augments, set), JSON.stringify(output))
}

export function loadTeamAugments(set: SetNumber, activeAugments: AugmentData[]): [AugmentList, AugmentList] {
	const json = getStorageJSON(set, StorageKey.Augments)
	return json != null && activeAugments != null && Array.isArray(json[0]) ? (json as string[][]).map(augmentNames => augmentNames.map(augmentName => activeAugments.find(augment => augment.name === augmentName) ?? null)) as [AugmentList, AugmentList] : [[null, null, null], [null, null, null]]
}

// Units

export function clearBoardStorage(set: SetNumber) {
	removeStorage(set, StorageKey.Units)
	removeStorage(set, StorageKey.Augments)
}

export function toStorage(units: ChampionUnit[]): StorageChampion[] {
	return units.map(unit => ({
		id: unit.data.apiName,
		hex: unit.startHex,
		starLevel: unit.starLevel,
		items: unit.items.map(item => item.apiName ?? item.id ?? -1),
		stacks: Object.entries(unit.stacks).map(stackEntry => [stackEntry[0], stackEntry[1].amount]),
	}))
}
export function saveUnits(set: SetNumber) {
	const output = toStorage(state.units.filter(unit => !unit.wasSpawnedDuringFight))
	if (output.length) {
		window.localStorage.setItem(keyToSet(StorageKey.Units, set), JSON.stringify(output))
	}
}

export function getSavedUnits(set: SetNumber) {
	return (getStorageJSON(set, StorageKey.Units) ?? []) as StorageChampion[]
}

export function saveComps(set: SetNumber) {
	window.localStorage.setItem(keyToSet(StorageKey.Comps, set), JSON.stringify(setDataReactive.compsUser))
}

export function getSavedComps(set: SetNumber) {
	return (getStorageJSON(set, StorageKey.Comps) ?? {}) as CustomComps
}
