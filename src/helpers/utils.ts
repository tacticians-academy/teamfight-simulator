import { getIconURL } from '@tacticians-academy/academy-library'
import type { SetNumber } from '@tacticians-academy/academy-library'

export const TESTING = process.env.NODE_ENV !== 'production'

export function getIconURLFor(state: { loadedSetNumber: SetNumber | null, setNumber: SetNumber }, deriveAsset: { icon: string | null | undefined; }, isRaw?: boolean) {
	return state.loadedSetNumber ? getIconURL(state.setNumber, deriveAsset, isRaw) : ''
}

export function uniqueIdentifier(index: number, entity: {name: string}) {
	return `${index}+${entity.name}`
}

export function getArrayValueCounts<T extends string | number | symbol>(array: T[]): [string, number][] {
	const result: {[index in T]: number} = {} as any
	array.forEach(el => {
		if (result[el] != null) {
			result[el] += 1
		} else {
			result[el] = 1
		}
	})
	return Object.entries(result)
}

export function randomItem<T>(array: T[]) {
	const len = array.length
	return len ? array[Math.floor(Math.random() * len)] : null
}
