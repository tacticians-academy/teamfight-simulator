import { state, clearUnitsAndReset } from '#/game/store'

import type { StorageChampion } from '#/helpers/types'

export function clearUnits() {
	clearUnitsAndReset()
	window.localStorage.setItem('TFTSIM_units', '')
}

export function saveUnits() {
	const output: StorageChampion[] = state.units
		.map(unit => ({
			name: unit.name,
			hex: unit.startHex,
			starLevel: unit.starLevel,
			items: unit.items.map(item => item.id),
		}))
	if (output.length) {
		window.localStorage.setItem('TFTSIM_units', JSON.stringify(output))
	}
}

export const enum StorageKey {
	Mutant = 'TFTSIM_mutant',
	StageNumber = 'TFTSIM_stage',
	SocialiteHexes = 'TFTSIM_socialites',
}

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
	return raw != null ? JSON.parse(raw) : null
}

export function setStorage(key: StorageKey, value: Object) {
	return window.localStorage.setItem(key, value.toString())
}
export function setStorageJSON(key: StorageKey, value: Object) {
	return setStorage(key, JSON.stringify(value))
}

export function getSavedUnits() {
	const raw = window.localStorage.getItem('TFTSIM_units')
	return raw != null && raw.length ? JSON.parse(raw) as StorageChampion[] : []
}

//SEED
if (window.localStorage.getItem('TFTSIM_v') == null) {
	window.localStorage.setItem('TFTSIM_v', '1')
	window.localStorage.setItem('TFTSIM_units', `[{"name":"Zyra","hex":[0,0],"starLevel":2,"items":[]},{"name":"Zyra","hex":[5,4],"starLevel":1,"items":[]},{"name":"Caitlyn","hex":[1,5],"starLevel":1,"items":[44]}]`)
}
