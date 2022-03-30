import { getIconURL } from '@tacticians-academy/academy-library'
import type { SetNumber } from '@tacticians-academy/academy-library'

export const TESTING = process.env.NODE_ENV !== 'production'

export function getIconURLFor(state: { setNumber: SetNumber }, deriveAsset: { icon: string | null | undefined; }, isRaw?: boolean) {
	return getIconURL(state.setNumber, deriveAsset, isRaw)
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

export function randomSign() {
	return Math.random() < 0.5 ? -1 : 1
}

export function randomItem<T>(array: T[]) {
	const len = array.length
	return len ? array[Math.floor(Math.random() * len)] : null
}

export function shuffle<T>(array: T[]) {
	let currentIndex = array.length, temporaryValue, randomIndex
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}
	return array
}
