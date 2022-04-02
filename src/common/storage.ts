import { SET_DATA } from '@tacticians-academy/academy-library'
import type { AugmentData, SetNumber } from '@tacticians-academy/academy-library'

const DEFAULT_SET: SetNumber = 6.5

import { state } from '#/common/store'
import type { HexCoord, StarLevel } from '#/common/types'

interface StorageChampion {
	name: string
	hex: HexCoord
	starLevel: StarLevel
	items: number[]
}

export const enum StorageKey {
	Augments = 'TFTSIM_augments',
	Mutant = 'TFTSIM_mutant',
	StageNumber = 'TFTSIM_stage',
	SocialiteHexes = 'TFTSIM_socialites',
	Units = 'TFTSIM_units',
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
	return json != null && Array.isArray(json[0]) ? (json as string[][]).map(augmentNames => augmentNames.map(augmentName => activeAugments.find(augment => augment.name === augmentName) ?? null)) as [AugmentList, AugmentList] : [[null, null, null], [null, null, null]]
}

// Units

export function clearBoardStorage(set: SetNumber) {
	removeStorage(set, StorageKey.Units)
	removeStorage(set, StorageKey.Augments)
}

export function saveUnits(set: SetNumber) {
	const output: StorageChampion[] = state.units
		.filter(unit => !unit.wasSpawnedDuringFight)
		.map(unit => ({
			name: unit.name,
			hex: unit.startHex,
			starLevel: unit.starLevel,
			items: unit.items.map(item => item.id),
		}))
	if (output.length) {
		window.localStorage.setItem(keyToSet(StorageKey.Units, set), JSON.stringify(output))
	}
}

export function getSavedUnits(set: SetNumber) {
	return (getStorageJSON(set, StorageKey.Units) ?? []) as StorageChampion[]
}

//SEED
if (window.localStorage.getItem('TFTSIM_v') == null) {
	window.localStorage.setItem('TFTSIM_v', '1')
	window.localStorage.setItem(keyToSet(StorageKey.Units, DEFAULT_SET), `[{"name":"Zyra","hex":[0,0],"starLevel":2,"items":[]},{"name":"Zyra","hex":[5,4],"starLevel":1,"items":[]},{"name":"Caitlyn","hex":[1,5],"starLevel":1,"items":[44]}]`)
}
