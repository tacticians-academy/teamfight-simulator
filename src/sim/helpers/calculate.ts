import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ChampionKey, ItemData, ItemKey, SpellCalculation, TraitKey } from '@tacticians-academy/academy-library'

import { setData } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'

import type { BonusEntry, BonusVariable, SpellKey, SynergyData } from '#/sim/helpers/types'

export function createDamageCalculation(variable: string, value: number, damageType: DamageType | undefined, stat?: BonusKey, statFromTarget?: boolean, ratio?: number, asPercent?: boolean, maximum?: number): SpellCalculation {
	return {
		asPercent: asPercent,
		damageType: damageType,
		parts: [{
			subparts: [{
				variable: variable,
				starValues: [value, value, value, value],
				stat,
				statFromTarget,
				ratio,
				max: maximum,
			}],
		}],
	}
}

export function solveSpellCalculationFrom(source: ChampionUnit | undefined, target: ChampionUnit | undefined, calculation: SpellCalculation): [value: number, damageType: DamageType | undefined] {
	let damageType = calculation.damageType
	const total = calculation.parts.reduce((partsAccumulator, part) => {
		const doesMultiplySubparts = part.operator === 'product'
		return partsAccumulator + part.subparts.reduce((subpartsAccumulator, subpart) => {
			let value = subpart.starValues?.[source?.starLevel ?? 1] ?? 1
			if (subpart.stat != null) {
				if (damageType !== DamageType.true) {
					if (subpart.stat === BonusKey.AttackDamage) {
						damageType = DamageType.physical
					} else if (!damageType && subpart.stat === BonusKey.AbilityPower) {
						damageType = DamageType.magic
					}
				}
				value *= (subpart.statFromTarget === true ? target : source)!.getStat(subpart.stat as BonusKey) * subpart.ratio!
			}
			if (subpart.max != null) {
				value = Math.min(subpart.max, value)
			}
			return doesMultiplySubparts ? (subpartsAccumulator * value) : (subpartsAccumulator + value)
		}, doesMultiplySubparts ? 1 : 0)
	}, 0)
	return [calculation.asPercent === true ? total * 100 : total, damageType]
}

export function calculateSynergyBonuses(unit: ChampionUnit, teamSynergies: SynergyData[], unitTraitKeys: TraitKey[]) {
	const bonuses: BonusEntry[] = []
	teamSynergies.forEach(({ key: traitKey, activeEffect }) => {
		if (activeEffect == null) {
			return
		}

		const unitHasTrait = unitTraitKeys.includes(traitKey)
		const bonusVariables: BonusVariable[] = []
		const traitEffectData = setData.traitEffects[traitKey]
		const teamEffect = traitEffectData?.teamEffect
		const teamTraitFn = traitEffectData?.team
		if (teamTraitFn) {
			const variables = teamTraitFn(unit, activeEffect) ?? []
			bonusVariables.push(...variables)
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
				const variables = soloTraitFn(unit, activeEffect) ?? []
				bonusVariables.push(...variables)
			}
		}
		if (bonusVariables.length) {
			bonuses.push([traitKey, bonusVariables])
		}
	})

	for (const trait of unitTraitKeys) {
		const innateTraitFn = setData.traitEffects[trait]?.innate
		if (innateTraitFn) {
			const synergy = teamSynergies.find(synergy => synergy.key === trait)
			const innateEffect = synergy?.activeEffect ?? synergy?.trait.effects[0]
			if (innateEffect) {
				const variables = innateTraitFn(unit, innateEffect)
				if (variables) { bonuses.push([trait, variables]) }
			}
		}
	}
	return bonuses
}

export function calculateItemBonuses(unit: ChampionUnit, items: ItemData[]) {
	const bonuses: BonusEntry[] = []
	items.forEach(item => {
		const disableDefaultVariables = setData.itemEffects[item.name]?.disableDefaultVariables
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

		const itemFn = setData.itemEffects[item.name]?.innate
		if (itemFn != null) {
			const variables = itemFn(item, unit) ?? []
			bonusVariables.push(...variables)
		}
		if (bonusVariables.length) {
			bonuses.push([item.name as ItemKey, bonusVariables])
		}
	})
	return bonuses
}

export function calculateChampionBonuses(unit: ChampionUnit) {
	const bonuses: BonusEntry[] = []
	const spell = unit.getCurrentSpell()
	const variables = unit.championEffects?.innate?.(spell, unit)
	if (variables) {
		bonuses.push([(spell?.name as SpellKey) ?? (unit.name as ChampionKey), variables])
	}
	return bonuses
}
