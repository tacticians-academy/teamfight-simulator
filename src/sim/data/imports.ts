import type { SetNumber } from '@tacticians-academy/academy-library'

/* eslint-disable @typescript-eslint/consistent-type-imports */

export async function importDefaultComps(set: SetNumber) {
	type DefaultComps = typeof import('./set6/6.5/defaultComps.js')
	if (set !== 6.5) {
		return {} as DefaultComps
	}
	if (set === 6.5) {
		return await import('./set6/6.5/defaultComps.js')
	}
	throw 'Unsupported set:' + set
}

export async function importAugmentEffects(set: SetNumber) {
	type AugmentEffects = typeof import('./set6/6.0/augments.js')
	if (set < 6) {
		return {} as AugmentEffects
	}

	if (set === 6) {
		return await import('./set6/6.0/augments.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/augments.js')
	}
	if (set >= 7) {
		return {} as AugmentEffects
	}
	throw 'Unsupported set:' + set
}

export async function importChampionEffects(set: SetNumber) {
	type ChampionEffects = typeof import('./set6/6.0/champions.js')
	if (set === 1) {
		return {} as ChampionEffects
	}
	if (set < 6) {
		return {} as ChampionEffects
	}
	if (set === 6) {
		return await import('./set6/6.0/champions.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/champions.js')
	}
	if (set >= 7) {
		return {} as ChampionEffects
	}
	throw 'Unsupported set:' + set
}

export async function importItemEffects(set: SetNumber) {
	type ItemEffects = typeof import('./set6/6.0/items.js')
	try {
		if (set === 1) {
			return {} as ItemEffects
		}
		if (set < 6) {
			return {} as ItemEffects
		}
		if (set === 6) {
			return await import('./set6/6.0/items.js')
		}
		if (set === 6.5) {
			return await import('./set6/6.5/items.js')
		}
		if (set >= 7) {
			return {} as ItemEffects
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
	if (set < 6) {
		return {} as TraitEffects
	}
	if (set === 6) {
		return await import('./set6/6.0/traits.js')
	}
	if (set === 6.5) {
		return await import('./set6/6.5/traits.js')
	}
	if (set >= 7) {
		return {} as TraitEffects
	}
	throw 'Unsupported set:' + set
}
