import { BonusKey } from '@tacticians-academy/academy-library'
import type { ItemData } from '@tacticians-academy/academy-library'

import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import traitEffects from '#/data/set6/traits'

import { TEAM_EFFECT_TRAITS } from '#/helpers/constants'
import type { BonusScaling, BonusVariable, SynergyData } from '#/helpers/types'

function getInnateEffectForUnitWith(trait: TraitKey, teamSynergies: SynergyData[]) {
	const synergy = teamSynergies.find(synergy => synergy[0].name === trait)
	return synergy?.[2] ?? synergy?.[0].effects[0]
}

export function calculateSynergyBonuses(teamSynergies: SynergyData[], unitTraitNames: TraitKey[]): [[TraitKey, BonusVariable[]][], BonusScaling[]] {
	const bonuses: [TraitKey, BonusVariable[]][] = []
	const scalings: BonusScaling[] = []
	teamSynergies.forEach(([trait, style, activeEffect]) => {
		if (activeEffect == null) {
			return
		}
		const teamEffect = TEAM_EFFECT_TRAITS[trait.apiName]
		const unitHasTrait = unitTraitNames.includes(trait.name as TraitKey)
		const teamTraitFn = traitEffects[trait.name as TraitKey]?.team
		const variables: BonusVariable[] = []
		if (teamTraitFn) {
			const [bonusVariables, bonusScalings] = teamTraitFn(activeEffect)
			variables.push(...bonusVariables)
			scalings.push(...bonusScalings)
		}
		if (teamEffect != null || unitHasTrait) {
			// console.log(trait.name, teamEffect, activeEffect.variables)
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
		}
		if (unitHasTrait) {
			const soloTraitFn = traitEffects[trait.name as TraitKey]?.solo
			if (soloTraitFn) {
				const [bonusVariables, bonusScalings] = soloTraitFn(activeEffect)
				variables.push(...bonusVariables)
				scalings.push(...bonusScalings)
			}
		}
		if (variables.length) {
			bonuses.push([trait.name as TraitKey, variables])
		}
	})
	for (const trait of unitTraitNames) {
		const innateTraitFn = traitEffects[trait]?.innate
		if (innateTraitFn) {
			const innateEffect = getInnateEffectForUnitWith(trait, teamSynergies)
			if (innateEffect) {
				const [bonusVariables, bonusScalings] = innateTraitFn(innateEffect)
				bonuses.push([trait, bonusVariables])
				scalings.push(...bonusScalings)
			}
		}
	}
	return [bonuses, scalings]
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

export function calculateItemScalings(items: ItemData[]) {
	const scalings: BonusScaling[] = []
	items.forEach(item => {
		const intervalAmount = item.effects['APPerInterval']
		const intervalSeconds = item.effects['IntervalSeconds']
		if (intervalAmount != null && intervalSeconds != null) {
			scalings.push({
				activatedAt: 0,
				source: item.name,
				stats: [BonusKey.AbilityPower],
				intervalAmount,
				intervalSeconds,
			})
		}
	})
	return scalings
}
