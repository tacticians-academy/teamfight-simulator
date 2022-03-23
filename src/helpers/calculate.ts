import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ItemData, SpellCalculation } from '@tacticians-academy/academy-library'
import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import itemEffects from '#/data/items'
import traitEffects from '#/data/set6/traits'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { BonusLabelKey, BonusScaling, BonusVariable, ShieldData, SynergyData } from '#/helpers/types'

function getInnateEffectForUnitWith(trait: TraitKey, teamSynergies: SynergyData[]) {
	const synergy = teamSynergies.find(synergy => synergy.key === trait)
	return synergy?.activeEffect ?? synergy?.trait.effects[0]
}

type BonusResults = [[BonusLabelKey, BonusVariable[]][], BonusScaling[], ShieldData[]]

export function createDamageCalculation(variable: string, value: number, damageType: DamageType | undefined, stat?: BonusKey, ratio?: number, asPercent?: boolean, maximum?: number): SpellCalculation {
	return {
		asPercent: asPercent,
		damageType: damageType,
		parts: [{
			subparts: [{
				variable: variable,
				starValues: [value, value, value, value],
				stat,
				ratio,
				max: maximum,
			}],
		}],
	}
}

export function solveSpellCalculationFrom(unit: ChampionUnit, calculation: SpellCalculation): [value: number, damageType: DamageType | undefined] {
	let damageType = calculation.damageType
	const total = calculation.parts.reduce((acc, part) => {
		const multiplyParts = part.operator === 'product'
		return acc + part.subparts.reduce((subAcc, subpart) => {
			let value = subpart.starValues[unit.starLevel]
			if (subpart.stat != null) {
				if (subpart.stat === BonusKey.AttackDamage) {
					damageType = DamageType.physical
				}
				if (subpart.stat === BonusKey.AttackDamage) {
					damageType = DamageType.physical
				} else if (!damageType && subpart.stat === BonusKey.AbilityPower) {
					damageType = DamageType.magic
				}
				value *= unit.getStat(subpart.stat as BonusKey) * subpart.ratio!
			}
			if (subpart.max != null) {
				value = Math.min(subpart.max, value)
			}
			return multiplyParts ? (subAcc * value) : (subAcc + value)
		}, multiplyParts ? 1 : 0)
	}, 0)
	return [calculation.asPercent === true ? total * 100 : total, damageType]
}

export function calculateSynergyBonuses(unit: ChampionUnit, teamSynergies: SynergyData[], unitTraitKeys: TraitKey[]): BonusResults {
	const bonuses: [TraitKey, BonusVariable[]][] = []
	const bonusScalings: BonusScaling[] = []
	const bonusShields: ShieldData[] = []
	teamSynergies.forEach(({ key: traitKey, activeEffect }) => {
		if (activeEffect == null) {
			return
		}

		const unitHasTrait = unitTraitKeys.includes(traitKey)
		const bonusVariables: BonusVariable[] = []
		const traitEffectData = traitEffects[traitKey]
		const teamEffect = traitEffectData?.teamEffect
		const teamTraitFn = traitEffectData?.team
		if (teamTraitFn) {
			const { variables, scalings, shields } = teamTraitFn(unit, activeEffect)
			if (variables) { bonusVariables.push(...variables) }
			if (scalings) { bonusScalings.push(...scalings) }
			if (shields) { bonusShields.push(...shields) }
		}
		if (teamEffect != null || unitHasTrait) {
			const disableDefaultVariables = traitEffectData?.disableDefaultVariables
			for (let variableKey in activeEffect.variables) {
				if (disableDefaultVariables != null && (disableDefaultVariables === true || disableDefaultVariables.includes(variableKey as BonusKey))) {
					continue
				}
				let value = activeEffect.variables[variableKey]
				if (unitHasTrait) {
					if (teamEffect === false) {
						if (variableKey.startsWith('Team')) {
							variableKey = variableKey.replace('Team', '')
						} else if (variableKey.startsWith(traitKey)) {
							variableKey = variableKey.replace(traitKey, '')
						} else {
							console.warn('Unknown key for Team', variableKey)
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
						if (!variableKey.startsWith('Team')) {
							continue
						}
						variableKey = variableKey.replace('Team', '')
					} else if (typeof teamEffect === 'object') {
						if (!teamEffect.includes(variableKey as BonusKey)) {
							continue
						}
					}
				}
				if (value != null) {
					bonusVariables.push([variableKey, value])
				}
			}
		}
		if (unitHasTrait) {
			const soloTraitFn = traitEffectData?.solo
			if (soloTraitFn) {
				const { variables, scalings, shields } = soloTraitFn(unit, activeEffect)
				if (variables) { bonusVariables.push(...variables) }
				if (scalings) { bonusScalings.push(...scalings) }
				if (shields) { bonusShields.push(...shields) }
			}
		}
		if (bonusVariables.length) {
			bonuses.push([traitKey, bonusVariables])
		}
	})
	for (const trait of unitTraitKeys) {
		const innateTraitFn = traitEffects[trait]?.innate
		if (innateTraitFn) {
			const innateEffect = getInnateEffectForUnitWith(trait, teamSynergies)
			if (innateEffect) {
				const { variables, scalings, shields } = innateTraitFn(unit, innateEffect)
				if (variables) { bonuses.push([trait, variables]) }
				if (scalings) { bonusScalings.push(...scalings) }
				if (shields) { bonusShields.push(...shields) }
			}
		}
	}
	return [bonuses, bonusScalings, bonusShields]
}

export function calculateItemBonuses(unit: ChampionUnit, items: ItemData[]): BonusResults {
	const bonuses: [ItemKey, BonusVariable[]][] = []
	const bonusScalings: BonusScaling[] = []
	const bonusShields: ShieldData[] = []
	items.forEach(item => {
		const disableDefaultVariables = itemEffects[item.id as ItemKey]?.disableDefaultVariables
		const bonusVariables: BonusVariable[] = []
		for (const effectKey in item.effects) {
			if (disableDefaultVariables != null && (disableDefaultVariables === true || disableDefaultVariables.includes(effectKey as BonusKey))) {
				continue
			}
			const value = item.effects[effectKey]
			if (value != null) {
				bonusVariables.push([effectKey, value])
			}
		}

		const itemFn = itemEffects[item.id as ItemKey]?.innate
		if (itemFn) {
			const { variables, scalings, shields } = itemFn(item, unit)
			if (variables) { bonusVariables.push(...variables) }
			if (scalings) { bonusScalings.push(...scalings) }
			if (shields) { bonusShields.push(...shields) }
		}
		if (bonusVariables.length) {
			bonuses.push([item.id, bonusVariables])
		}
	})
	return [bonuses, bonusScalings, bonusShields]
}
