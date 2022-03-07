import { state } from '#/game/store'

import type { StorageChampion } from '#/helpers/types'

export function saveUnits() {
	const output: StorageChampion[] = state.units
		.map(unit => ({
			name: unit.name,
			position: unit.startPosition,
			starLevel: unit.starLevel,
			items: unit.items.map(item => item.id),
		}))
	window.localStorage.setItem('TFTSIM_units', JSON.stringify(output))
}

export const enum StorageKey {
	Mutant = 'TFTSIM_mutant',
	StageNumber = 'TFTSIM_stage',
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
export function setStorage(key: StorageKey, value: Object) {
	return window.localStorage.setItem(key, value.toString())
}

export function getSavedUnits() {
	const raw = window.localStorage.getItem('TFTSIM_units')
	return raw != null && raw.length ? JSON.parse(raw) as StorageChampion[] : []
}

//SEED
if (window.localStorage.getItem('TFTSIM_v') == null) {
	window.localStorage.setItem('TFTSIM_v', '1')
	window.localStorage.setItem('TFTSIM_units', `[{"name":"Zyra","position":[0,0],"starLevel":2,"items":[]},{"name":"Zyra","position":[5,4],"starLevel":1,"items":[]},{"name":"Caitlyn","position":[1,5],"starLevel":1,"items":[44]}]`)
}
