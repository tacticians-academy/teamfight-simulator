import type { BonusKey, ItemData } from '@tacticians-academy/academy-library'

import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import itemEffects from '#/data/items'
import traitEffects from '#/data/set6/traits'

import { TEAM_EFFECT_TRAITS } from '#/helpers/constants'
import type { BonusLabelKey, BonusScaling, BonusVariable, ShieldData, SynergyData, TeamNumber } from '#/helpers/types'

function getInnateEffectForUnitWith(trait: TraitKey, teamSynergies: SynergyData[]) {
	const synergy = teamSynergies.find(synergy => synergy[0].name === trait)
	return synergy?.[2] ?? synergy?.[0].effects[0]
}

type BonusResults = [[BonusLabelKey, BonusVariable[]][], BonusScaling[], ShieldData[]]

export function calculateSynergyBonuses(teamSynergies: SynergyData[], teamNumber: TeamNumber, unitTraitKeys: TraitKey[]): BonusResults {
	const bonuses: [TraitKey, BonusVariable[]][] = []
	const bonusScalings: BonusScaling[] = []
	const bonusShields: ShieldData[] = []
	teamSynergies.forEach(([trait, style, activeEffect]) => {
		if (activeEffect == null) {
			return
		}
		const teamEffect = TEAM_EFFECT_TRAITS[trait.apiName]
		const unitHasTrait = unitTraitKeys.includes(trait.name as TraitKey)
		const teamTraitFn = traitEffects[trait.name as TraitKey]?.team
		const bonusVariables: BonusVariable[] = []
		if (teamTraitFn) {
			const { variables, scalings, shields } = teamTraitFn(activeEffect, teamNumber)
			if (variables) { bonusVariables.push(...variables) }
			if (scalings) { bonusScalings.push(...scalings) }
			if (shields) { bonusShields.push(...shields) }
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
				bonusVariables.push([key, value])
			}
		}
		if (unitHasTrait) {
			const soloTraitFn = traitEffects[trait.name as TraitKey]?.solo
			if (soloTraitFn) {
				const { variables, scalings, shields } = soloTraitFn(activeEffect, teamNumber)
				if (variables) { bonusVariables.push(...variables) }
				if (scalings) { bonusScalings.push(...scalings) }
				if (shields) { bonusShields.push(...shields) }
			}
		}
		if (bonusVariables.length) {
			bonuses.push([trait.name as TraitKey, bonusVariables])
		}
	})
	for (const trait of unitTraitKeys) {
		const innateTraitFn = traitEffects[trait]?.innate
		if (innateTraitFn) {
			const innateEffect = getInnateEffectForUnitWith(trait, teamSynergies)
			if (innateEffect) {
				const { variables, scalings, shields } = innateTraitFn(innateEffect, teamNumber)
				if (variables) { bonuses.push([trait, variables]) }
				if (scalings) { bonusScalings.push(...scalings) }
				if (shields) { bonusShields.push(...shields) }
			}
		}
	}
	return [bonuses, bonusScalings, bonusShields]
}

export function calculateItemBonuses(items: ItemData[]): BonusResults {
	const bonuses: [ItemKey, BonusVariable[]][] = []
	const bonusScalings: BonusScaling[] = []
	const bonusShields: ShieldData[] = []
	items.forEach(item => {
		const variables: BonusVariable[] = []
		for (const key in item.effects) {
			variables.push([key, item.effects[key]])
		}

		const itemFn = itemEffects[item.id as ItemKey]?.innate
		if (itemFn) {
			const { variables, scalings, shields } = itemFn(item)
			if (variables) { variables.push(...variables) }
			if (scalings) { bonusScalings.push(...scalings) }
			if (shields) { bonusShields.push(...shields) }
		}
		if (variables.length) {
			bonuses.push([item.id, variables])
		}
	})
	return [bonuses, bonusScalings, bonusShields]
}
