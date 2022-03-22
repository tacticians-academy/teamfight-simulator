import type { AugmentData } from '@tacticians-academy/academy-library'
import { activeAugments } from '@tacticians-academy/academy-library/dist/set6/augments'

import { state, clearUnitsAndReset } from '#/game/store'

import type { StorageChampion } from '#/helpers/types'

export const enum StorageKey {
	Augments = 'TFTSIM_augments',
	Mutant = 'TFTSIM_mutant',
	StageNumber = 'TFTSIM_stage',
	SocialiteHexes = 'TFTSIM_socialites',
	Units = 'TFTSIM_units',
}

// Generic

export function getStorageInt(key: StorageKey, defaultValue: number = 0) {
	const value = window.localStorage.getItem(key)
	if (value == null) {
		return defaultValue
	}
	const int = parseInt(value, 10)
	return isNaN(int) ? defaultValue : int
}
export function getStorageString(key: StorageKey) {
	return window.localStorage.getItem(key)
}
export function getStorageJSON(key: StorageKey) {
	const raw = window.localStorage.getItem(key)
	return raw != null && raw.length ? JSON.parse(raw) : null
}

export function setStorage(key: StorageKey, value: Object) {
	return window.localStorage.setItem(key, value.toString())
}
export function setStorageJSON(key: StorageKey, value: Object) {
	return setStorage(key, JSON.stringify(value))
}

// Augments

export function saveTeamAugments() {
	const output: string[][] = state.augmentsByTeam
		.map(augments => augments.map(augment => augment?.name ?? ''))
	window.localStorage.setItem('TFTSIM_augments', JSON.stringify(output))
}

type AugmentList = [AugmentData | null, AugmentData | null, AugmentData | null]

export function loadTeamAugments(): [AugmentList, AugmentList] {
	const json = getStorageJSON(StorageKey.Augments)
	return json != null && Array.isArray(json[0]) ? (json as string[][]).map(augmentNames => augmentNames.map(augmentName => activeAugments.find(augment => augment.name === augmentName) ?? null)) as [AugmentList, AugmentList] : [[null, null, null], [null, null, null]]
}

// Units

export function clearUnits() {
	clearUnitsAndReset()
	window.localStorage.setItem(StorageKey.Units, '')
}

export function saveUnits() {
	const output: StorageChampion[] = state.units
		.filter(unit => !unit.wasSpawned)
		.map(unit => ({
			name: unit.name,
			hex: unit.startHex,
			starLevel: unit.starLevel,
			items: unit.items.map(item => item.id),
		}))
	if (output.length) {
		window.localStorage.setItem(StorageKey.Units, JSON.stringify(output))
	}
}

export function getSavedUnits() {
	return (getStorageJSON(StorageKey.Units) ?? []) as StorageChampion[]
}

//SEED
if (window.localStorage.getItem('TFTSIM_v') == null) {
	window.localStorage.setItem('TFTSIM_v', '1')
	window.localStorage.setItem(StorageKey.Units, `[{"name":"Zyra","hex":[0,0],"starLevel":2,"items":[]},{"name":"Zyra","hex":[5,4],"starLevel":1,"items":[]},{"name":"Caitlyn","hex":[1,5],"starLevel":1,"items":[44]}]`)
}
