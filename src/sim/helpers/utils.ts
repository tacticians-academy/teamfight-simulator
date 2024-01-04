import type { ItemData } from '@tacticians-academy/academy-library'

export const TESTING = process.env.NODE_ENV !== 'production'

export function isEmpty(object: Record<string, any>) {
	for (const _ in object) {
		return false
	}
	return true
}

export function sum(arr: number[]) {
	return arr.reduce((acc, curr) => acc + curr, 0)
}

export function getItemByIdentifier(identifier: number | string | null, items: ItemData[]) {
	if (typeof identifier === 'number') {
		return items.find(item => item.id === identifier)
	}
	return items.find(item => item.apiName === identifier)
}

export function uniqueIdentifier(index: number, entity: {name: string}) {
	return `${index}+${entity.name}`
}

export function getArrayValueCounts<T extends string | number | symbol>(array: T[]): [string, number][] {
	const result: Partial<Record<T, number>> = {}
	array.forEach(el => {
		if (result[el] != null) {
			result[el]! += 1 //NOTE TS limitation
		} else {
			result[el] = 1
		}
	})
	return Object.entries(result)
}

// Get best

export function getBestSortedAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	const results: [number, T][] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value != null) {
			results.push([value, entry])
		}
	})
	return results
		.sort((a, b) => (b[0] - a[0]) * (isMaximum ? 1 : -1))
		.map(data => data[1])
}

export function getBestUniqueAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | undefined {
	let bestValue: number | null
	let bestResult: T | undefined
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) return

		if (bestValue == null || (isMaximum ? value > bestValue : value < bestValue)) {
			bestValue = value
			bestResult = entry
		}
	})
	return bestResult
}

export function getBestArrayAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	let bestValue: number | null
	let bestResults: T[] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) return

		if (bestValue == null || (isMaximum ? value > bestValue : value < bestValue)) {
			bestValue = value
			bestResults = [entry]
		} else if (value === bestValue) {
			bestResults.push(entry)
		}
	})
	return bestResults
}

export function getBestRandomAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | undefined {
	return randomItem(getBestArrayAsMax(isMaximum, entries, valueFn)) ?? undefined
}

// Random

export function randomBool() {
	return Math.random() < 0.5
}

export function randomSign() {
	return randomBool() ? -1 : 1
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

export function randomItems<T>(maxCount: number, array: T[]) {
	return shuffle(array).slice(0, maxCount)
}

export function getWeightedRandom(data: [value: any, weight: any][], minWeight: number = 1) {
	let acc = 0
	const sorted = data
		.filter(entry => entry[1] > minWeight - 1)
		.sort((a, b) => a[1] - b[1])
		.map(entry => {
			acc += entry[1]
			entry[1] = acc
			return entry
		})
	const random = Math.random() * acc
	return sorted.find(entry => entry[1] > random)![0]
}
