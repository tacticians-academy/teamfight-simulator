import { BonusKey, COMPONENT_ITEM_IDS, DamageType } from '@tacticians-academy/academy-library'
import type { TraitEffectData } from '@tacticians-academy/academy-library'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { ChampionUnit } from '#/game/ChampionUnit'
import { getters, state } from '#/game/store'

import { getAttackableUnitsOfTeam, getUnitsOfTeam } from '#/helpers/abilityUtils'
import { createDamageCalculation } from '#/helpers/bonuses'
import { DamageSourceType, MutantBonus, MutantType, StatusEffectType } from '#/helpers/types'
import type { BonusVariable, BonusScaling, EffectResults, ShieldData, StarLevel, TeamNumber } from '#/helpers/types'
import { getClosestHexAvailableTo, getHexRing, getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import { HexEffect } from '#/game/HexEffect'

type TraitEffectFn = (unit: ChampionUnit, activeEffect: TraitEffectData) => EffectResults
interface TraitFns {
	teamEffect: boolean | number | BonusKey[]
	disableDefaultVariables?: true | BonusKey[]
	solo?: TraitEffectFn
	team?: TraitEffectFn
	applyForOthers?: (activeEffect: TraitEffectData, unit: ChampionUnit) => void
	onceForTeam?: (activeEffect: TraitEffectData, teamNumber: TeamNumber, units: ChampionUnit[]) => void
	innate?: TraitEffectFn
	update?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) => EffectResults
	allyDeath?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, traitUnits: ChampionUnit[]) => number
	enemyDeath?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, traitUnits: ChampionUnit[]) => number
	basicAttack?: (activeEffect: TraitEffectData, target: ChampionUnit, source: ChampionUnit, canReProc: boolean) => void
	damageDealtByHolder?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => number
	modifyDamageByHolder?: (activeEffect: TraitEffectData, originalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, damageType: DamageType) => number
	hpThreshold?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	cast?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
}

const BODYGUARD_DELAY_MS = 4000 //TODO experimentally determine

export default {

	[TraitKey.Arcanist]: {
		teamEffect: false,
	},

	[TraitKey.Bodyguard]: {
		innate: (unit, innateEffect) => {
			unit.queueHexEffect(0, undefined, {
				startsAfterMS: BODYGUARD_DELAY_MS,
				hexDistanceFromSource: 1,
				damageMultiplier: 0.5,
				taunts: true,
			})
			return {}
		},
		solo: (unit, activeEffect) => {
			const shields: ShieldData[] = []
			const shieldAmount = activeEffect.variables['ShieldAmount']
			if (shieldAmount != null) {
				shields.push({
					source: unit,
					activatesAtMS: BODYGUARD_DELAY_MS,
					amount: shieldAmount,
				})
			} else {
				console.log('ERR', 'Missing', 'shieldAmount', activeEffect)
			}
			return { shields }
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
			const durationSeconds = activeEffect.variables['BurstDuration']
			const bonusAS = activeEffect.variables['BonusAS']
			if (durationSeconds == null || bonusAS == null) {
				return console.log('ERR', TraitKey.Chemtech, activeEffect.variables)
			}
			const bonusMoveSpeed = 500 //TODO determine
			const expiresAtMS = elapsedMS + durationSeconds * 1000
			traitUnits.forEach(unit => unit.setBonusesFor(TraitKey.Challenger, [BonusKey.AttackSpeed, bonusAS, expiresAtMS], [BonusKey.MoveSpeed, bonusMoveSpeed, expiresAtMS]))
		},
	},

	[TraitKey.Chemtech]: {
		disableDefaultVariables: true,
		hpThreshold: (activeEffect, elapsedMS, unit) => {
			const damageReduction = activeEffect.variables[BonusKey.DamageReduction]
			const durationSeconds = activeEffect.variables['Duration']
			const attackSpeed = activeEffect.variables[BonusKey.AttackSpeed]
			const healthRegen = activeEffect.variables['HPRegen']
			if (durationSeconds == null || attackSpeed == null || damageReduction == null || healthRegen == null) {
				return console.log('ERR', TraitKey.Chemtech, activeEffect.variables)
			}
			const durationMS = durationSeconds * 1000
			const expiresAtMS = elapsedMS + durationMS
			unit.addBonuses(TraitKey.Chemtech, [BonusKey.AttackSpeed, attackSpeed, expiresAtMS], [BonusKey.DamageReduction, damageReduction / 100, expiresAtMS])
			unit.scalings.add({
				source: unit,
				sourceID: TraitKey.Chemtech,
				activatedAtMS: elapsedMS,
				expiresAfterMS: durationMS,
				stats: [BonusKey.Health],
				intervalAmount: healthRegen / 100 * unit.healthMax,
				intervalSeconds: 1,
			})
		},
	},

	[TraitKey.Clockwork]: {
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			const bonusPerAugment = activeEffect.variables['BonusPerAugment']
			const bonusAS = activeEffect.variables['ASBonus']
			if (bonusPerAugment != null) {
				variables.push([BonusKey.AttackSpeed, getters.augmentCount.value * bonusPerAugment * 100])
			} else {
				console.log('Invalid effect', 'Clockwork', activeEffect.variables)
			}
			if (bonusAS != null) {
				variables.push([BonusKey.AttackSpeed, bonusAS * 100])
			} else {
				console.log('Invalid effect', 'Clockwork', activeEffect.variables)
			}
			return { variables }
		},
	},

	[TraitKey.Colossus]: {
		innate: (unit, innateEffect) => {
			const variables: BonusVariable[] = []
			const bonusHealth = innateEffect.variables[`Bonus${BonusKey.Health}Tooltip`]
			if (bonusHealth != null) {
				variables.push([BonusKey.Health, bonusHealth])
			} else {
				console.log('Missing Colossus HP bonus', innateEffect.variables)
			}
			return { variables }
		},
	},

	[TraitKey.Enforcer]: {
		onceForTeam: (activeEffect, teamNumber, units) => {
			const detainCount = activeEffect.variables['DetainCount']
			if (detainCount == null) {
				return console.log('ERR', TraitKey.Enforcer, activeEffect)
			}
			const stunnableUnits = getAttackableUnitsOfTeam(1 - teamNumber as TeamNumber)
			if (detainCount >= 1) {
				let highestHP = 0
				let bestUnit: ChampionUnit | undefined
				stunnableUnits.forEach(unit => {
					if (unit.healthMax > highestHP) {
						highestHP = unit.healthMax
						bestUnit = unit
					}
				})
				if (bestUnit) {
					applyEnforcerDetain(activeEffect, bestUnit)
				}
			}
			if (detainCount >= 2) { //NOTE option for user to target
				let highestScore = 0
				let bestUnit: ChampionUnit | undefined
				stunnableUnits.forEach(unit => {
					if (unit.statusEffects.stunned.active) { return }
					const attackDPS = unit.attackDamage() * unit.attackSpeed()
					const starCostItems = (unit.data.cost ?? 1) * unit.starMultiplier + Math.pow(unit.items.length, 2)
					const magicDPSScore = (unit.abilityPower() - 90) / 10
					const score = starCostItems + attackDPS / 20 + magicDPSScore
					if (score > highestScore) {
						highestScore = score
						bestUnit = unit
					}
				})
				if (bestUnit) {
					applyEnforcerDetain(activeEffect, bestUnit)
				}
			}
		},
	},

	[TraitKey.Hextech]: {
		solo: (unit, activeEffect) => {
			const shields: ShieldData[] = []
			const shieldAmount = activeEffect.variables['ShieldAmount']
			const durationSeconds = activeEffect.variables['ShieldDuration']
			const damage = activeEffect.variables['MagicDamage']
			const frequency = activeEffect.variables['Frequency']
			if (shieldAmount == null || damage == null || durationSeconds == null || frequency == null) {
				console.log('ERR', 'Missing', TraitKey.Hextech, activeEffect)
			} else {
				const repeatsEveryMS = frequency * 1000
				shields.push({
					source: unit,
					amount: shieldAmount,
					bonusDamage: createDamageCalculation(TraitKey.Hextech, damage, DamageType.magic),
					expiresAtMS: durationSeconds * 1000,
					activatesAtMS: repeatsEveryMS,
					repeatsEveryMS,
				})
			}
			return { shields }
		},
	},

	[TraitKey.Enchanter]: {
		teamEffect: [BonusKey.MagicResist],
	},

	[TraitKey.Innovator]: {
		onceForTeam: (activeEffect, teamNumber, units) => {
			const starLevelMultiplier = activeEffect.variables['InnovatorStarLevelMultiplier']
			const starLevel = activeEffect.variables['InnovationStarLevel']
			if (starLevelMultiplier == null || starLevel == null) {
				return console.log('ERR', TraitKey.Innovator, activeEffect)
			}
			const innovationNames = [ChampionKey.MalzaharVoidling, ChampionKey.Tibbers, ChampionKey.HexTechDragon]
			const innovationName = innovationNames[starLevel - 1]
			const innovations = state.units.filter(unit => unit.team === teamNumber && innovationNames.includes(unit.name as ChampionKey))
			let innovation = innovations.find(unit => unit.name === innovationName)
			state.units = state.units.filter(unit => unit.team !== teamNumber || !innovationNames.includes(unit.name as ChampionKey) || unit === innovation)
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
			innovation.addBonuses(TraitKey.Innovator, [BonusKey.AttackDamage, innovation.attackDamage() * innovationMultiplier], [BonusKey.Health, innovation.healthMax * innovationMultiplier])
			innovation.healthMax += innovation.healthMax * innovationMultiplier
			innovation.health = innovation.healthMax
		},
	},

	[TraitKey.Mutant]: {
		basicAttack: (activeEffect, target, source, canReProc) => {
			if (state.mutantType === MutantType.AdrenalineRush) {
				if (canReProc) {
					const multiAttackProcChance = source.getMutantBonus(MutantType.AdrenalineRush, MutantBonus.AdrenalineProcChance)
					if (checkProcChance(multiAttackProcChance)) {
						source.attackStartAtMS = 1
					}
				}
			}
		},
		damageDealtByHolder: (activeEffect, elapsedMS, originalSource, target, source, sourceType, rawDamage, takingDamage, damageType) => {
			if (state.mutantType === MutantType.Voidborne) {
				const executeThreshold = activeEffect.variables['MutantVoidborneExecuteThreshold']
				if (executeThreshold == null) {
					return console.log('ERR', 'No executeThreshold', state.mutantType, activeEffect)
				}
				if (target.healthProportion() <= executeThreshold / 100) {
					target.die(elapsedMS)
				} else if (originalSource) {
					const trueDamageBonus = activeEffect.variables['MutantVoidborneTrueDamagePercent']
					if (trueDamageBonus != null) {
						const damageCalculation = createDamageCalculation('MutantVoidborneTrueDamagePercent', rawDamage * trueDamageBonus / 100, DamageType.true)
						target.damage(elapsedMS, false, source, DamageSourceType.trait, damageCalculation, false)
					}
				}
			}
		},
		solo: (unit, activeEffect) => {
			const scalings: BonusScaling[] = []
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.Metamorphosis) {
				const intervalSeconds = activeEffect.variables['MutantMetamorphosisGrowthRate']
				const amountARMR = activeEffect.variables['MutantMetamorphosisArmorMR']
				const amountADAP = activeEffect.variables['MutantMetamorphosisADAP']
				if (intervalSeconds != null && amountADAP != null && amountARMR != null) {
					scalings.push(
						{
							source: unit,
							sourceID: state.mutantType,
							activatedAtMS: 0,
							stats: [BonusKey.AttackDamage, BonusKey.AbilityPower],
							intervalAmount: amountADAP,
							intervalSeconds,
						},
						{
							source: unit,
							sourceID: state.mutantType,
							activatedAtMS: 0,
							stats: [BonusKey.Armor, BonusKey.MagicResist],
							intervalAmount: amountARMR,
							intervalSeconds,
						},
					)
				} else {
					console.log('ERR Invalid Metamorphosis', activeEffect.variables)
				}
			} else if (state.mutantType === MutantType.Cybernetic) {
				if (unit.items.length) {
					const cyberHP = activeEffect.variables['MutantCyberHP']
					const cyberAD = activeEffect.variables['MutantCyberAD']
					if (cyberHP != null && cyberAD != null) {
						variables.push([BonusKey.Health, cyberHP])
						variables.push([BonusKey.AttackDamage, cyberAD])
					}
				}
			}
			return { scalings, variables }
		},
		team: (unit, activeEffect) => {
			const variables: BonusVariable[] = []
			if (state.mutantType === MutantType.BioLeeching) {
				const omnivamp = activeEffect.variables['MutantBioLeechingOmnivamp']
				if (omnivamp != null) {
					variables.push([BonusKey.VampOmni, omnivamp])
				} else {
					console.log('Invalid effect', 'Mutant', state.mutantType, activeEffect.variables)
				}
			}
			return { variables }
		},
	},

	[TraitKey.Scholar]: {
		team: (unit, activeEffect) => {
			const scalings: BonusScaling[] = []
			const intervalAmount = activeEffect.variables['ManaPerTick']
			const intervalSeconds = activeEffect.variables['TickRate']
			if (intervalAmount != null && intervalSeconds != null) {
				scalings.push({
					source: undefined,
					sourceID: TraitKey.Scholar,
					activatedAtMS: 0,
					stats: [BonusKey.Mana],
					intervalAmount,
					intervalSeconds,
				})
			} else {
				console.log('Invalid effect', 'Scholar', activeEffect.variables)
			}
			return { scalings }
		},
	},

	[TraitKey.Scrap]: {
		team: (unit, activeEffect) => {
			const shields: ShieldData[] = []
			const amountPerComponent = activeEffect.variables['HPShieldAmount']
			if (amountPerComponent != null) {
				const amount = getUnitsOfTeam(unit.team)
					.reduce((unitAcc, unit) => {
						return unitAcc + unit.items.reduce((itemAcc, item) => itemAcc + amountPerComponent * (COMPONENT_ITEM_IDS.includes(item.id) ? 1 : 2), 0)
					}, 0)
				shields.push({
					source: unit,
					amount,
				})
			}
			return { shields }
		},
	},

	[TraitKey.Sniper]: {
		modifyDamageByHolder: (activeEffect, originalSource, target, source, sourceType, rawDamage, damageType) => { //TODO modify damage
			if (originalSource) {
				const key = 'PercentDamageIncrease'
				const percentBonusDamagePerHex = activeEffect.variables[key]
				if (percentBonusDamagePerHex == null) {
					return console.log('ERR', 'Missing', key, activeEffect)
				}
				const hexDistance = source.hexDistanceTo(target)
				return rawDamage * (1 + percentBonusDamagePerHex / 100 * hexDistance)
			}
		},
	},

	[TraitKey.Socialite]: {
		team: (unit, activeEffect) => {
			const scalings: BonusScaling[] = []
			const variables: BonusVariable[] = []
			const mirrorHex = getMirrorHex(unit.startHex)
			if (state.socialiteHexes.some(hex => isSameHex(hex, mirrorHex))) {
				const damagePercent = activeEffect.variables['DamagePercent']
				const manaPerSecond = activeEffect.variables['ManaPerSecond']
				const omnivampPercent = activeEffect.variables['OmnivampPercent']
				if (damagePercent != null) {
					variables.push(['DamagePercent' as BonusKey, damagePercent], [BonusKey.VampOmni, omnivampPercent])
					if (manaPerSecond != null) {
						scalings.push({
							source: unit,
							sourceID: TraitKey.Socialite,
							activatedAtMS: 0,
							stats: [BonusKey.Mana],
							intervalAmount: manaPerSecond,
							intervalSeconds: 1,
						})
					}
				} else {
					console.log('ERR', TraitKey.Socialite, activeEffect)
				}
			}
			return { variables, scalings }
		},
	},

	[TraitKey.Syndicate]: {
		disableDefaultVariables: true,
		update: (activeEffect, elapsedMS, units) => {
			const syndicateArmor = activeEffect.variables['Armor']
			const syndicateMR = activeEffect.variables['MR']
			const syndicateOmnivamp = activeEffect.variables['PercentOmnivamp']
			const syndicateIncrease = activeEffect.variables['SyndicateIncrease'] ?? 0
			const traitLevel = activeEffect.variables['TraitLevel']
			if (traitLevel == null || syndicateArmor == null || syndicateMR == null) {
				return
			}
			const syndicateMultiplier = syndicateIncrease + 1
			if (traitLevel === 1) {
				let lowestHP = Number.MAX_SAFE_INTEGER
				let lowestHPUnit: ChampionUnit | undefined
				units.forEach(unit => {
					if (unit.health < lowestHP) {
						lowestHP = unit.health
						lowestHPUnit = unit
					}
				})
				if (lowestHPUnit) {
					units.forEach(unit => unit.setBonusesFor(TraitKey.Syndicate))
					units = [lowestHPUnit]
				}
			}
			const bonuses: BonusVariable[] = [
				[BonusKey.Armor, syndicateArmor * syndicateMultiplier],
				[BonusKey.MagicResist, syndicateMR * syndicateMultiplier],
			]
			if (syndicateOmnivamp != null) {
				bonuses.push([BonusKey.VampOmni, syndicateOmnivamp * syndicateMultiplier])
			}
			units.forEach(unit => unit.setBonusesFor(TraitKey.Syndicate, ...bonuses))
		},
	},

	[TraitKey.Twinshot]: {
		basicAttack: (activeEffect, target, source, canReProc) => {
			if (canReProc) {
				const multiAttackProcChance = activeEffect.variables['ProcChance']
				if (checkProcChance(multiAttackProcChance)) {
					source.attackStartAtMS = 1
				}
			}
		},
		cast: (activeEffect, elapsedMS, unit) => {
			const multiAttackProcChance = activeEffect.variables['ProcChance']
			if (checkProcChance(multiAttackProcChance)) {
				unit.castAbility(elapsedMS, false) //TODO delay castTime
			}
		},
	},

} as { [key in TraitKey]?: TraitFns }

function checkProcChance(procChance: number | null) {
	if (procChance == null) {
		console.warn('ERR', 'procChance')
		return false
	}
	return Math.random() * 100 < procChance //TODO rng
}

function applyEnforcerDetain(activeEffect: TraitEffectData, unit: ChampionUnit) {
	const detainSeconds = activeEffect.variables['DetainDuration']
	const healthPercent = activeEffect.variables['HPPercent']
	if (detainSeconds == null || healthPercent == null) {
		return console.log('ERR', TraitKey.Enforcer, activeEffect)
	}
	const healthThreshold = unit.health - healthPercent * unit.healthMax
	unit.applyStatusEffect(0, StatusEffectType.stunned, detainSeconds * 1000, healthThreshold)
}
