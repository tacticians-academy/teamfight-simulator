import type { ItemKey } from '#/data/set6/items'
import { TraitKey } from '#/data/set6/traits'

import { TEAM_EFFECT_TRAITS } from '#/helpers/constants'
import { BonusKey } from '#/helpers/types'
import type { BonusVariable, ItemData, SynergyData } from '#/helpers/types'

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
							continue
						}
						key = key.replace(trait.name, '')
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
						if (!teamEffect.includes(key)) {
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
	//TODO Colossus
	if (unitTraitNames.includes(TraitKey.Sniper)) {
		const synergy = teamSynergies.find(synergy => synergy[0].name === TraitKey.Sniper)
		const synergyEffect = synergy?.[2]
		if (!synergyEffect) {
			const synergyData = synergy?.[0]
			const value = synergyData?.effects[0].variables[BonusKey.HexRangeIncrease] ?? 1
			bonuses.push([TraitKey.Sniper, [[BonusKey.HexRangeIncrease, value]]])
		}
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
