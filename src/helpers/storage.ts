import { state } from '#/game/store'

import type { StorageChampion } from '#/helpers/types'

export function saveUnits() {
	const output = state.units.map(unit => {
		return {
			name: unit.name,
			position: unit.startPosition,
			starLevel: unit.starLevel,
		}
	})
	window.localStorage.setItem('TFTSIM_units', JSON.stringify(output))
}

export function getSavedUnits() {
	const raw = window.localStorage.getItem('TFTSIM_units')
	return raw != null && raw.length ? JSON.parse(raw) as StorageChampion[] : []
}
