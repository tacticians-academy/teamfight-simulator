import type { SetNumber } from '@tacticians-academy/academy-library'

/* eslint-disable @typescript-eslint/consistent-type-imports */

export async function importAugmentEffects(set: SetNumber) {
	type AugmentEffects = typeof import('./set6/6.0/augments.js')
	if (set === 1) {
		return {} as AugmentEffects
	}
	if (set === 6) {
		return await import('./set6/6.0/augments.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/augments.js')
	}
	throw 'Unsupported set:' + set
}

export async function importChampionEffects(set: SetNumber) {
	type ChampionEffects = typeof import('./set6/6.0/champions.js')
	if (set === 1) {
		return {} as ChampionEffects
	}
	if (set === 6) {
		return await import('./set6/6.0/champions.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/champions.js')
	}
	throw 'Unsupported set:' + set
}

export async function importItemEffects(set: SetNumber) {
	type ItemEffects = typeof import('./set6/6.0/items.js')
	try {
		if (set === 1) {
			return {} as ItemEffects
		}
		if (set === 6) {
			return await import('./set6/6.0/items.js')
		}
		if (set === 6.5) {
			return await import('./set6/6.5/items.js')
		}
	} catch (error) {
		console.log(error)
	}
	throw 'Unsupported set:' + set
}

export async function importTraitEffects(set: SetNumber) {
	type TraitEffects = typeof import('./set6/6.0/traits.js')
	if (set === 1) {
		return {} as TraitEffects
	}
	if (set === 6) {
		return await import('./set6/6.0/traits.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/traits.js')
	}
	throw 'Unsupported set:' + set
}
