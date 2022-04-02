export const TESTING = process.env.NODE_ENV !== 'production'

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

// Get best

export function getBestSortedAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	const results: [number, T][] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		results.push([value, entry])
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
		if (value == null) { return }
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
		if (value == null) { return }
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
