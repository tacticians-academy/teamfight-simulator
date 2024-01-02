import { getIconURL } from '@tacticians-academy/academy-library'
import type { SetNumber } from '@tacticians-academy/academy-library'

export function getIconURLFor(state: { setNumber: SetNumber }, deriveAsset: { icon: string | null | undefined; }, isRaw?: boolean) {
	return getIconURL(state.setNumber, deriveAsset, isRaw)
}

export function getTeamName(team: number) {
	return team === 0 ? 'Blue' : 'Red'
}

export function isEmpty(object: Record<string, any>) {
	for (const _ in object) {
		return false
	}
	return true
}

export function sum(arr: number[]) {
	return arr.reduce((acc, curr) => acc + curr, 0)
}
