import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { TEAM_EFFECT_TRAITS } from '#/helpers/constants'
import type { BonusVariable, SynergyData } from '#/helpers/types'

function getInnateEffectForUnitWith(trait: TraitKey, unitTraitNames: string[], teamSynergies: SynergyData[]) {
	if (!unitTraitNames.includes(trait)) {
		return undefined
	}
	const synergy = teamSynergies.find(synergy => synergy[0].name === trait)
	return synergy?.[2] ?? synergy?.[0].effects[0]
}

export function calculateSynergyBonuses(teamSynergies: SynergyData[], unitTraitNames: string[]) {
	const bonuses: [TraitKey, BonusVariable[]][] = []
	teamSynergies.forEach(([trait, style, activeEffect]) => {
		if (activeEffect == null) { return }
		const teamEffect = TEAM_EFFECT_TRAITS[trait.apiName]
		const unitHasTrait = unitTraitNames.includes(trait.name)
		if (teamEffect != null || unitHasTrait) {
			const variables: BonusVariable[] = []
			for (let key in activeEffect.variables) {
				let value = activeEffect.variables[key]
				if (unitHasTrait) {
					if (teamEffect === false) {
						if (key.startsWith('Team')) {
							key = key.replace('Team', '')
						} else if (key.startsWith(trait.name)) {
							key = key.replace(trait.name, '')
						} else {
							console.warn('Unknown key for Team /', trait.name)
							continue
						}
					}
					if (value != null) {
						if (typeof teamEffect === 'number') {
							value *= teamEffect
						}
					}
				} else {
					if (teamEffect === false) {
						if (!key.startsWith('Team')) {
							continue
						}
						key = key.replace('Team', '')
					} else if (typeof teamEffect === 'object') {
						if (!teamEffect.includes(key as BonusKey)) {
							continue
						}
					}
				}
				variables.push([key, value])
			}
			bonuses.push([trait.name as TraitKey, variables])
		}
	})

	// Innate bonuses (not handled in data)
	const colossusEffect = getInnateEffectForUnitWith(TraitKey.Colossus, unitTraitNames, teamSynergies)
	if (colossusEffect) {
		const value = colossusEffect.variables[`Bonus${BonusKey.Health}Tooltip`]
		if (value != null) {
			bonuses.push([TraitKey.Colossus, [[BonusKey.Health, value]]])
		} else {
			console.log('Missing Colossus HP bonus', colossusEffect)
		}
	}
	const sniperEffect = getInnateEffectForUnitWith(TraitKey.Colossus, unitTraitNames, teamSynergies)
	if (sniperEffect) {
		const value = sniperEffect.variables[BonusKey.HexRangeIncrease]
		bonuses.push([TraitKey.Sniper, [[BonusKey.HexRangeIncrease, value]]])
	}
	return bonuses
}

export function calculateItemBonuses(items: ItemData[]) {
	const bonuses: [ItemKey, BonusVariable[]][] = []
	items.forEach(item => {
		const variables: BonusVariable[] = []
		for (const key in item.effects) {
			variables.push([key, item.effects[key]])
		}
		bonuses.push([item.id, variables])
	})
	return bonuses
}
