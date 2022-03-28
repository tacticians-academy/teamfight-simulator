import { BonusKey, COMPONENT_ITEM_IDS, DamageType } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { getSocialiteHexesFor, INNOVATION_NAMES } from '#/data/set6/utils'

import { ChampionUnit } from '#/game/ChampionUnit'
import { getters, state } from '#/game/store'

import { getAttackableUnitsOfTeam, getBestAsMax, getUnitsOfTeam, getVariables } from '#/helpers/abilityUtils'
import { getClosestHexAvailableTo, getFrontBehindHexes, getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { DamageSourceType, MutantBonus, MutantType, StatusEffectType } from '#/helpers/types'
import type { BonusVariable, StarLevel, TeamNumber, TraitEffects } from '#/helpers/types'

const BODYGUARD_DELAY_MS = 4000 //TODO experimentally determine

export const traitEffects = {

	[TraitKey.Arcanist]: {
		teamEffect: false,
	},

	[TraitKey.Bodyguard]: {
		innate: (unit, innateEffect) => {
			unit.queueHexEffect(0, undefined, {
				startsAfterMS: BODYGUARD_DELAY_MS,
				hexDistanceFromSource: 1,
				opacity: 0.5,
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
			const challengersTargeting = traitUnits.filter(unit => unit.target === dead)
			if (!challengersTargeting.length) {
				return
			}
			const [durationSeconds, bonusAS] = getVariables(activeEffect, 'BurstDuration', 'BonusAS')
			const bonusMoveSpeed = 500 //TODO determine
			const expiresAtMS = elapsedMS + durationSeconds * 1000
			challengersTargeting.forEach(unit => unit.setBonusesFor(TraitKey.Challenger, [BonusKey.AttackSpeed, bonusAS, expiresAtMS], [BonusKey.MoveSpeed, bonusMoveSpeed, expiresAtMS]))
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
			const variables: BonusVariable[] = []
			const [bonusPerAugment, bonusAS] = getVariables(activeEffect, 'BonusPerAugment', 'ASBonus')
			variables.push([BonusKey.AttackSpeed, bonusAS * 100], [BonusKey.AttackSpeed, getters.augmentCount.value * bonusPerAugment * 100])
			return variables
		},
	},

	[TraitKey.Colossus]: {
		innate: (unit, innateEffect) => {
			const [bonusHealth] = getVariables(innateEffect, `Bonus${BonusKey.Health}Tooltip`)
			const variables: BonusVariable[] = [[BonusKey.Health, bonusHealth]]
			return variables
		},
	},

	[TraitKey.Enforcer]: {
		onceForTeam: (activeEffect, teamNumber, units) => {
			const [detainCount] = getVariables(activeEffect, 'DetainCount')
			let stunnableUnits = getAttackableUnitsOfTeam(1 - teamNumber as TeamNumber)
			if (detainCount >= 1) {
				const bestUnit = getBestAsMax(true, stunnableUnits, (unit) => unit.healthMax)
				if (bestUnit) {
					applyEnforcerDetain(activeEffect, bestUnit)
				}
			}
			if (detainCount >= 2) { //NOTE option for user to target
				stunnableUnits = stunnableUnits.filter(unit => !unit.statusEffects.stunned.active)
				const bestUnit = getBestAsMax(true, stunnableUnits, (unit) => {
					const attackDPS = unit.attackDamage() * unit.attackSpeed()
					const starCostItems = (unit.data.cost ?? 1) * unit.starMultiplier + Math.pow(unit.items.length, 2)
					const magicDPSScore = (unit.abilityPower() - 90) / 10
					return starCostItems + attackDPS / 20 + magicDPSScore
				})
				if (bestUnit) {
					applyEnforcerDetain(activeEffect, bestUnit)
				}
			}
		},
	},

	[TraitKey.Hextech]: {
		solo: (unit, activeEffect) => {
			const [shieldAmount, durationSeconds, damage, frequency] = getVariables(activeEffect, 'ShieldAmount', 'ShieldDuration', 'MagicDamage', 'Frequency')
			const repeatsEveryMS = frequency * 1000
			unit.queueShield(0, unit, {
				amount: shieldAmount,
				activatesAfterMS: repeatsEveryMS,
				repeatsEveryMS,
				expiresAfterMS: durationSeconds * 1000,
				bonusDamage: createDamageCalculation(TraitKey.Hextech, damage, DamageType.magic),
			})
		},
	},

	[TraitKey.Enchanter]: {
		teamEffect: [BonusKey.MagicResist],
	},

	[TraitKey.Innovator]: {
		onceForTeam: (activeEffect, teamNumber, units) => {
			const [starLevelMultiplier, starLevel] = getVariables(activeEffect, 'InnovatorStarLevelMultiplier', 'InnovationStarLevel')
			const innovationName = INNOVATION_NAMES[starLevel - 1]
			const innovations = state.units.filter(unit => unit.team === teamNumber && INNOVATION_NAMES.includes(unit.name as ChampionKey))
			let innovation = innovations.find(unit => unit.name === innovationName)
			state.units = state.units.filter(unit => unit.team !== teamNumber || !INNOVATION_NAMES.includes(unit.name as ChampionKey) || unit === innovation)
			if (!innovation || innovation.name !== innovationName) {
				const innovationHex = (innovation ?? innovations[0])?.startHex ?? getClosestHexAvailableTo(teamNumber === 0 ? [6, 0] : [1, 1], state.units)
				if (innovationHex != null) {
					innovation = new ChampionUnit(innovationName, innovationHex, starLevel as StarLevel)
					innovation.genericReset()
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

	[TraitKey.Mastermind]: {
		applyForOthers: (activeEffect, unit) => {
			const [manaGrant] = getVariables(activeEffect, 'ManaGrant')
			const hexesInFront = getFrontBehindHexes(unit, true)
			getUnitsOfTeam(unit.team)
				.filter(unit => unit.isIn(hexesInFront))
				.forEach(unit => unit.setBonusesFor(TraitKey.Mastermind, [BonusKey.Mana, manaGrant]))
			window.setTimeout(() => { //TODO remove
				unit.queueHexEffect(0, undefined, {
					targetTeam: unit.team,
					hexes: hexesInFront,
				})
			})
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
		damageDealtByHolder: (activeEffect, elapsedMS, isOriginalSource, target, source, sourceType, rawDamage, takingDamage, damageType) => {
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
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.AdrenalineRush) {
				variables.push([BonusKey.AttackDamage, getMutantBonusFor(activeEffect, MutantType.AdrenalineRush, MutantBonus.AdrenalineAD)])
			} else if (state.mutantType === MutantType.SynapticWeb) {
				variables.push([BonusKey.AbilityPower, getMutantBonusFor(activeEffect, MutantType.SynapticWeb, MutantBonus.SynapticAP)], [BonusKey.ManaReduction, getMutantBonusFor(activeEffect, MutantType.SynapticWeb, MutantBonus.SynapticManaCost)])
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
					variables.push([BonusKey.Health, cyberHP], [BonusKey.AttackDamage, cyberAD])
				}
			}
			return variables
		},
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.BioLeeching) {
				const [omnivamp] = getVariables(activeEffect, 'MutantBioLeechingOmnivamp')
				variables.push([BonusKey.VampOmni, omnivamp])
			}
			return variables
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

	[TraitKey.Rivals]: {
		solo: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			if (unit.name === ChampionKey.Vi) {
				const [manaReduction] = getVariables(activeEffect, 'ViManaReduction')
				variables.push([BonusKey.ManaReduction, manaReduction])
			} else if (unit.name !== ChampionKey.Jinx) {
				console.log('ERR', TraitKey.Rivals, unit.name)
			}
			return variables
		},
		enemyDeath: (activeEffect, elapsedMS, dead, [unit]) => {
			if (unit.name === ChampionKey.Jinx) {
				if (unit.target !== dead) { //TODO use damage credit instead
					return
				}
				const [empoweredSeconds, empoweredAS] = getVariables(activeEffect, 'JinxASDuration', 'JinxEmpoweredAS')
				unit.setBonusesFor(TraitKey.Rivals, [BonusKey.AttackSpeed, empoweredAS * 100, elapsedMS + empoweredSeconds * 1000])
			} else if (unit.name !== ChampionKey.Vi) {
				console.log('ERR', TraitKey.Rivals, unit.name)
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
		modifyDamageByHolder: (activeEffect, isOriginalSource, target, source, sourceType, rawDamage, damageType) => { //TODO modify damage
			if (isOriginalSource) {
				const [percentBonusDamagePerHex] = getVariables(activeEffect, 'PercentDamageIncrease')
				const hexDistance = source.hexDistanceTo(target)
				return rawDamage * (1 + percentBonusDamagePerHex / 100 * hexDistance)
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
				const lowestHPSyndicate = getBestAsMax(false, units, (unit) => unit.health)
				if (lowestHPSyndicate) {
					units.forEach(unit => unit.setBonusesFor(TraitKey.Syndicate))
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

	[TraitKey.YordleLord]: {
		solo: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			const yordleEffectVariables = getters.synergiesByTeam.value[unit.team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Yordle)?.activeEffect?.variables
			if (yordleEffectVariables) {
				for (const key in yordleEffectVariables) {
					const yordleValue = yordleEffectVariables[key]
					if (yordleValue != null) {
						variables.push([key, yordleValue])
					}
				}
			}
			return variables
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
