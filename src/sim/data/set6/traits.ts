import { TraitKey, BonusKey, COMPONENT_ITEM_IDS, DamageType } from '@tacticians-academy/academy-library'
import type { ChampionKey, TraitEffectData } from '@tacticians-academy/academy-library'

import { getters, state } from '#/store/store'

import { ChampionUnit } from '#/sim/ChampionUnit'

import { getSocialiteHexesFor, INNOVATION_NAMES } from '#/sim/data/set6/utils'
import type { TraitEffects } from '#/sim/data/types'

import { getClosestHexAvailableTo, isInBackLines } from '#/sim/helpers/board'
import { createDamageCalculation } from '#/sim/helpers/calculate'
import { BOARD_COL_COUNT } from '#/sim/helpers/constants'
import { getAttackableUnitsOfTeam, getUnitsOfTeam, getVariables } from '#/sim/helpers/effectUtils'
import { getMirrorHex, isSameHex } from '#/sim/helpers/hexes'
import { MutantBonus, MutantType, StatusEffectType } from '#/sim/helpers/types'
import type { BonusVariable, StarLevel, TeamNumber } from '#/sim/helpers/types'
import { getBestRandomAsMax, getBestUniqueAsMax } from '#/sim/helpers/utils'

const BODYGUARD_DELAY_MS = 2000 //TODO experimentally determine

export const baseTraitEffects = {

	[TraitKey.Arcanist]: {
		teamEffect: false,
	},

	[TraitKey.Bodyguard]: {
		innate: (unit, innateEffect) => {
			unit.queueHexEffect(0, undefined, {
				startsAfterMS: BODYGUARD_DELAY_MS,
				hexDistanceFromSource: 1,
				opacity: 0.2,
				taunts: true,
			})
		},
		solo: (unit, activeEffect) => {
			const [amount] = getVariables(activeEffect, 'ShieldAmount')
			unit.queueShield(0, unit, {
				amount,
				activatesAfterMS: BODYGUARD_DELAY_MS,
			})
		},
	},

	[TraitKey.Bruiser]: {
		teamEffect: 2,
	},

	[TraitKey.Challenger]: {
		disableDefaultVariables: true,
		enemyDeath: (activeEffect, elapsedMS, dead, traitUnits) => {
			const takedownChallengers = traitUnits.filter(unit => unit.hasAssistCreditFor(dead))
			if (!takedownChallengers.length) {
				return
			}
			const [durationSeconds, bonusAS] = getVariables(activeEffect, 'BurstDuration', 'BonusAS')
			const bonusMoveSpeed = 500 //TODO determine
			const expiresAtMS = elapsedMS + durationSeconds * 1000
			takedownChallengers.forEach(unit => unit.setBonusesFor(TraitKey.Challenger, [BonusKey.AttackSpeed, bonusAS, expiresAtMS], [BonusKey.MoveSpeed, bonusMoveSpeed, expiresAtMS]))
		},
	},

	[TraitKey.Chemtech]: {
		disableDefaultVariables: true,
		hpThreshold: (activeEffect, elapsedMS, unit) => {
			applyChemtech(elapsedMS, activeEffect, unit)
		},
	},

	[TraitKey.Clockwork]: {
		team: (unit, activeEffect) => {
			const [bonusPerAugment, bonusAS] = getVariables(activeEffect, 'BonusPerAugment', 'ASBonus')
			return [
				[BonusKey.AttackSpeed, bonusAS * 100],
				[BonusKey.AttackSpeed, getters.augmentCount.value * bonusPerAugment * 100],
			]
		},
	},

	[TraitKey.Colossus]: {
		innate: (unit, innateEffect) => {
			const [bonusHealth] = getVariables(innateEffect, `Bonus${BonusKey.Health}Tooltip`)
			unit.applyStatusEffect(0, StatusEffectType.ccImmune, 60 * 1000)
			return [
				[BonusKey.Health, bonusHealth],
			]
		},
	},

	[TraitKey.Enforcer]: {
		onceForTeam: (activeEffect, teamNumber, units) => {
			const [detainCount] = getVariables(activeEffect, 'DetainCount')
			const stunnableUnits = getAttackableUnitsOfTeam(1 - teamNumber as TeamNumber)
			for (let count = 1; count <= detainCount; count += 1) {
				const bestUnit = getBestRandomAsMax(true, stunnableUnits.filter(unit => !unit.statusEffects.stunned.active), (unit) => unit.healthMax)
				if (!bestUnit) {
					break
				}
				applyEnforcerDetain(activeEffect, bestUnit)
			}
		},
	},

	[TraitKey.Enchanter]: {
		teamEffect: [BonusKey.MagicResist],
	},

	[TraitKey.Innovator]: {
		shouldKeepSpawn: (spawnedUnit) => {
			return INNOVATION_NAMES.includes(spawnedUnit.name as ChampionKey)
		},
		onceForTeam: (activeEffect, teamNumber, units) => {
			const [starLevelMultiplier, starLevel] = getVariables(activeEffect, 'InnovatorStarLevelMultiplier', 'InnovationStarLevel')
			const innovationName = INNOVATION_NAMES[starLevel - 1]
			const innovations = state.units.filter(unit => unit.team === teamNumber && INNOVATION_NAMES.includes(unit.name as ChampionKey))
			let innovation = innovations.find(unit => unit.name === innovationName)
			state.units = state.units.filter(unit => unit.team !== teamNumber || !INNOVATION_NAMES.includes(unit.name as ChampionKey) || unit === innovation)
			if (!innovation || innovation.name !== innovationName) {
				const innovationHex = (innovation ?? innovations[0])?.startHex ?? getClosestHexAvailableTo(teamNumber === 0 ? [BOARD_COL_COUNT - 1, 0] : [0, state.rowsTotal - 1], state.units)
				if (innovationHex != null) {
					innovation = new ChampionUnit(innovationName, innovationHex, starLevel as StarLevel)
					innovation.genericReset()
					innovation.team = teamNumber
					state.units.push(innovation)
				} else {
					return console.log('ERR', 'No available hex', TraitKey.Innovator)
				}
			}
			const totalInnovatorsStarLevel = units.reduce((totalStarLevel, unit) => totalStarLevel + unit.starLevel, 0)
			const innovationMultiplier = starLevelMultiplier * totalInnovatorsStarLevel
			innovation.setBonusesFor(TraitKey.Innovator, [BonusKey.AttackDamage, innovation.attackDamage() * innovationMultiplier], [BonusKey.Health, innovation.baseHP() * innovationMultiplier])
		},
	},

	[TraitKey.Mutant]: {
		disableDefaultVariables: true,
		basicAttack: (activeEffect, target, source, canReProc) => {
			if (state.mutantType === MutantType.AdrenalineRush) {
				if (canReProc) {
					const multiAttackProcChance = getMutantBonusFor(activeEffect, MutantType.AdrenalineRush, MutantBonus.AdrenalineProcChance)
					if (checkProcChance(multiAttackProcChance)) {
						source.attackStartAtMS = 1
					}
				}
			}
		},
		damageDealtByHolder: (activeEffect, elapsedMS, target, source, { isOriginalSource, rawDamage }) => {
			if (state.mutantType === MutantType.Voidborne) {
				const [executeThreshold] = getVariables(activeEffect, 'MutantVoidborneExecuteThreshold')
				if (target.healthProportion() <= executeThreshold / 100) {
					target.die(elapsedMS, source)
				} else if (isOriginalSource) {
					const [trueDamageBonus] = getVariables(activeEffect, 'MutantVoidborneTrueDamagePercent')
					if (trueDamageBonus > 0) {
						const damageCalculation = createDamageCalculation('MutantVoidborneTrueDamagePercent', rawDamage * trueDamageBonus / 100, DamageType.true)
						target.takeBonusDamage(elapsedMS, source, damageCalculation, false)
					}
				}
			}
		},
		solo: (unit, activeEffect) => {
			if (state.mutantType === MutantType.AdrenalineRush) {
				return [
					[BonusKey.AttackDamage, getMutantBonusFor(activeEffect, MutantType.AdrenalineRush, MutantBonus.AdrenalineAD)],
				]
			} else if (state.mutantType === MutantType.SynapticWeb) {
				return [
					[BonusKey.AbilityPower, getMutantBonusFor(activeEffect, MutantType.SynapticWeb, MutantBonus.SynapticAP)],
					[BonusKey.ManaReduction, getMutantBonusFor(activeEffect, MutantType.SynapticWeb, MutantBonus.SynapticManaCost)],
				]
			} else if (state.mutantType === MutantType.Metamorphosis) {
				const [intervalSeconds, amountARMR, amountADAP] = getVariables(activeEffect, 'MutantMetamorphosisGrowthRate', 'MutantMetamorphosisArmorMR', 'MutantMetamorphosisADAP')
				unit.scalings.add({
					source: unit,
					sourceID: state.mutantType,
					activatedAtMS: 0,
					stats: [BonusKey.AttackDamage, BonusKey.AbilityPower],
					intervalAmount: amountADAP,
					intervalSeconds,
				})
				unit.scalings.add({
					source: unit,
					sourceID: state.mutantType,
					activatedAtMS: 0,
					stats: [BonusKey.Armor, BonusKey.MagicResist],
					intervalAmount: amountARMR,
					intervalSeconds,
				})
			} else if (state.mutantType === MutantType.Cybernetic) {
				if (unit.items.length) {
					const [cyberHP, cyberAD] = getVariables(activeEffect, 'MutantCyberHP', 'MutantCyberAD')
					return [
						[BonusKey.Health, cyberHP],
						[BonusKey.AttackDamage, cyberAD],
					]
				}
			}
		},
		team: (unit, activeEffect) => {
			if (state.mutantType === MutantType.BioLeeching) {
				const [omnivamp] = getVariables(activeEffect, 'MutantBioLeechingOmnivamp')
				return [
					[BonusKey.VampOmni, omnivamp],
				]
			}
		},
		allyDeath: (activeEffect, elapsedMS, dead, traitUnits) => {
			if (state.mutantType === MutantType.VoraciousAppetite) {
				const increaseADAP = getMutantBonusFor(activeEffect, MutantType.VoraciousAppetite, MutantBonus.VoraciousADAP)
				traitUnits.forEach(unit => {
					unit.addBonuses(TraitKey.Mutant, [BonusKey.AttackDamage, increaseADAP], [BonusKey.AbilityPower, increaseADAP])
				})
			}
		},
	},

	[TraitKey.Scholar]: {
		team: (unit, activeEffect) => {
			const [intervalAmount, intervalSeconds] = getVariables(activeEffect, 'ManaPerTick', 'TickRate')
			unit.scalings.add({
				source: undefined,
				sourceID: TraitKey.Scholar,
				activatedAtMS: 0,
				stats: [BonusKey.Mana],
				intervalAmount,
				intervalSeconds,
			})
		},
	},

	[TraitKey.Scrap]: {
		team: (unit, activeEffect) => {
			const [amountPerComponent] = getVariables(activeEffect, 'HPShieldAmount')
			const amount = getUnitsOfTeam(unit.team)
				.reduce((unitAcc, unit) => {
					return unitAcc + unit.items.reduce((itemAcc, item) => itemAcc + amountPerComponent * (COMPONENT_ITEM_IDS.includes(item.id) ? 1 : 2), 0)
				}, 0)
			unit.queueShield(0, unit, { amount })
		},
	},

	[TraitKey.Sniper]: {
		modifyDamageByHolder: (activeEffect, target, source, damage) => {
			if (damage.isOriginalSource) {
				const [percentBonusDamagePerHex] = getVariables(activeEffect, 'PercentDamageIncrease')
				const hexDistance = source.hexDistanceTo(target)
				damage.rawDamage *= (1 + percentBonusDamagePerHex / 100 * hexDistance)
			}
		},
	},

	[TraitKey.Socialite]: {
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			const mirrorHex = getMirrorHex(unit.startHex)
			getSocialiteHexesFor(unit.team).forEach(([statsMultiplier, socialiteHexes]) => {
				if (socialiteHexes.some(hex => isSameHex(hex, mirrorHex))) {
					const [damagePercent, manaPerSecond, omnivampPercent] = getVariables(activeEffect, 'DamagePercent', 'ManaPerSecond', 'OmnivampPercent')
					variables.push([BonusKey.DamageIncrease, damagePercent * statsMultiplier], [BonusKey.VampOmni, omnivampPercent * statsMultiplier])
					if (manaPerSecond > 0) {
						unit.scalings.add({
							source: unit,
							sourceID: TraitKey.Socialite,
							activatedAtMS: 0,
							stats: [BonusKey.Mana],
							intervalAmount: manaPerSecond * statsMultiplier,
							intervalSeconds: 1,
						})
					}
				}
			})
			return variables
		},
	},

	[TraitKey.Syndicate]: {
		disableDefaultVariables: true,
		update: (activeEffect, elapsedMS, units) => {
			const [armor, mr, omnivamp, syndicateIncrease, traitLevel] = getVariables(activeEffect, BonusKey.Armor, BonusKey.MagicResist, 'PercentOmnivamp', 'SyndicateIncrease', 'TraitLevel')
			const syndicateMultiplier = syndicateIncrease + 1
			if (traitLevel === 1) {
				const lowestHPSyndicate = getBestRandomAsMax(false, units, (unit) => unit.health) //TODO should be stable
				if (lowestHPSyndicate) {
					units.forEach(unit => unit.removeBonusesFor(TraitKey.Syndicate))
					units = [lowestHPSyndicate]
				}
			}
			const bonuses: BonusVariable[] = [
				[BonusKey.Armor, armor * syndicateMultiplier],
				[BonusKey.MagicResist, mr * syndicateMultiplier],
			]
			if (omnivamp > 0) {
				bonuses.push([BonusKey.VampOmni, omnivamp * syndicateMultiplier])
			}
			units.forEach(unit => unit.setBonusesFor(TraitKey.Syndicate, ...bonuses))
		},
	},

	[TraitKey.Transformer]: {
		solo: (unit, activeEffect) => {
			const isRanged = isInBackLines(unit)
			unit.transformIndex = isRanged ? 1 : 0
			if (isRanged) {
				return [
					[BonusKey.HexRangeIncrease, 3],
				]
			}
		},
	},

	[TraitKey.Twinshot]: {
		basicAttack: (activeEffect, target, source, canReProc) => {
			if (canReProc) {
				const [multiAttackProcChance] = getVariables(activeEffect, 'ProcChance')
				if (checkProcChance(multiAttackProcChance)) {
					source.attackStartAtMS = 1
				}
			}
		},
		cast: (activeEffect, elapsedMS, unit) => {
			const [multiAttackProcChance] = getVariables(activeEffect, 'ProcChance')
			if (checkProcChance(multiAttackProcChance)) {
				unit.castAbility(elapsedMS, false) //TODO delay castTime
			}
		},
	},

} as TraitEffects

function getMutantBonusFor({ variables }: TraitEffectData, mutantType: MutantType, bonus: MutantBonus) {
	if (state.mutantType !== mutantType) {
		console.log('ERR', mutantType, state.mutantType, bonus)
		return null
	}
	const value = variables[`Mutant${state.mutantType}${bonus}`]
	if (value === undefined) {
		console.log('ERR', mutantType, bonus, variables)
		return null
	}
	return value
}

function checkProcChance(procChance: number | null | undefined) {
	return procChance == null ? false : Math.random() * 100 < procChance //TODO rng
}

function applyEnforcerDetain(activeEffect: TraitEffectData, unit: ChampionUnit) {
	const [detainSeconds, healthPercent] = getVariables(activeEffect, 'DetainDuration', 'HPPercent')
	const healthThreshold = unit.health - healthPercent * unit.healthMax
	unit.applyStatusEffect(0, StatusEffectType.stunned, detainSeconds * 1000, healthThreshold)
}

export function applyChemtech(elapsedMS: DOMHighResTimeStamp, activeEffect: TraitEffectData, unit: ChampionUnit) {
	const sourceID = TraitKey.Chemtech
	const [damageReduction, durationSeconds, attackSpeed, healthRegen] = getVariables(activeEffect, BonusKey.DamageReduction, 'Duration', BonusKey.AttackSpeed, 'HPRegen')
	const durationMS = durationSeconds * 1000
	const expiresAtMS = elapsedMS + durationMS
	unit.setBonusesFor(sourceID, [BonusKey.AttackSpeed, attackSpeed, expiresAtMS], [BonusKey.DamageReduction, damageReduction / 100, expiresAtMS])
	Array.from(unit.scalings) //TODO generalize sourceID check
		.filter(scaling => scaling.sourceID === sourceID)
		.forEach(scaling => unit.scalings.delete(scaling))
	unit.scalings.add({
		source: unit,
		sourceID,
		activatedAtMS: elapsedMS,
		expiresAfterMS: durationMS,
		stats: [BonusKey.Health],
		intervalAmount: healthRegen / 100 * unit.healthMax,
		intervalSeconds: 1,
	})
}
