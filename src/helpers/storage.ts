import { state } from '#/game/store'

import type { StorageChampion } from '#/helpers/types'

export function saveUnits() {
	const output: StorageChampion[] = state.units
		.map(unit => ({
			name: unit.name,
			position: unit.startPosition,
			starLevel: unit.starLevel,
			items: unit.items.map(item => item.name),
		}))
	window.localStorage.setItem('TFTSIM_units', JSON.stringify(output))
}

export function getSavedUnits() {
	const raw = window.localStorage.getItem('TFTSIM_units')
	return raw != null && raw.length ? JSON.parse(raw) as StorageChampion[] : []
}
