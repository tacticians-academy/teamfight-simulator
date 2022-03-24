export async function importAugmentEffects(setNumber: number) {
	type AugmentEffects = typeof import('./set6/augments.js') // eslint-disable-line @typescript-eslint/consistent-type-imports
	if (setNumber === 1) {
		return {} as AugmentEffects
	}
	if (setNumber === 6) {
		return await import('./set6/augments.js')
	}
	throw 'Unsupported set:' + setNumber
}

export async function importChampionEffects(setNumber: number) {
	type ChampionEffects = typeof import('./set6/champions.js') // eslint-disable-line @typescript-eslint/consistent-type-imports
	if (setNumber === 1) {
		return {} as ChampionEffects
	}
	if (setNumber === 6) {
		return await import('./set6/champions.js')
	}
	throw 'Unsupported set:' + setNumber
}

export async function importItemEffects(setNumber: number) {
	type ItemEffects = typeof import('./set6/items.js') // eslint-disable-line @typescript-eslint/consistent-type-imports
	try {
		if (setNumber === 1) {
			return {} as ItemEffects
		}
		if (setNumber === 6) {
			return await import('../data/set6/items.js')
		}
	} catch (error) {
		console.log(error)
	}
	throw 'Unsupported set:' + setNumber
}

export async function importTraitEffects(setNumber: number) {
	type TraitEffects = typeof import('./set6/traits.js') // eslint-disable-line @typescript-eslint/consistent-type-imports
	if (setNumber === 1) {
		return {} as TraitEffects
	}
	if (setNumber === 6) {
		return await import('./set6/traits.js')
	}
	throw 'Unsupported set:' + setNumber
}
