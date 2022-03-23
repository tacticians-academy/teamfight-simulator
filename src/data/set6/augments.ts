import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { applyChemtech } from '#/data/set6/traits'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { getters, state } from '#/game/store'

import { applyGrievousBurn, getBestAsMax, getUnitsOfTeam, getVariables, spawnUnit } from '#/helpers/abilityUtils'
import { getHexRing, isInBackLines } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { DamageSourceType, StatusEffectType } from '#/helpers/types'
import type { ShieldData, TeamNumber } from '#/helpers/types'

export interface AugmentFns {
	delayed?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, team: TeamNumber, units: ChampionUnit[]) => void
	teamWideTrait?: TraitKey
	startOfFight?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	apply?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	cast?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	onDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit | undefined) => void
	onShield?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, shield: ShieldData, target: ChampionUnit, source: ChampionUnit) => void
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit | undefined) => void
	hpThreshold?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	damageDealtByHolder?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, isOriginalSource: boolean, target: ChampionUnit, source: ChampionUnit, sourceType: DamageSourceType, rawDamage: number, takingDamage: number, damageType: DamageType) => number
}

export const augmentEffects = {

	[AugmentGroupKey.ArchangelsEmbrace]: {
		cast: (augment, elapsedMS, unit) => {
			const [manaPercent] = getVariables(augment, 'ManaPercent')
			unit.addBonuses(AugmentGroupKey.ArchangelsEmbrace, [BonusKey.AbilityPower, unit.manaMax() * manaPercent / 100])
		},
	},

	[AugmentGroupKey.Ascension]: {
		delayed: (augment, elapsedMS, team, units) => {
			const [damageAmp] = getVariables(augment, 'DamageAmp')
			units.forEach(unit => unit.setBonusesFor(AugmentGroupKey.Ascension, [BonusKey.DamageIncrease, damageAmp / 100]))
		},
	},

	[AugmentGroupKey.ArmorPlating]: {
		hpThreshold: (augment, elapsedMS, unit) => {
			if (!unit.hasTrait(TraitKey.Colossus)) { return }
			const [invulnerabilitySeconds] = getVariables(augment, 'InvulnDuration')
			unit.applyStatusEffect(elapsedMS, StatusEffectType.invulnerable, invulnerabilitySeconds * 1000)
		},
	},

	[AugmentGroupKey.Backfoot]: {
		apply: (augment, team, units) => {
			const [attackSpeed] = getVariables(augment, BonusKey.AttackSpeed)
			units
				.filter(unit => isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Backfoot, [BonusKey.AttackSpeed, attackSpeed * 100]))
		},
	},

	[AugmentGroupKey.BrokenStopwatch]: {
		delayed: (augment, elapsedMS, team, units) => {
			const [stunSeconds] = getVariables(augment, 'StunDuration')
			state.units
				.filter(unit => !unit.hasTrait(TraitKey.Clockwork))
				.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, stunSeconds * 1000))
		},
	},

	[AugmentGroupKey.Battlemage]: {
		apply: (augment, team, units) => {
			const [ap] = getVariables(augment, BonusKey.AbilityPower)
			units
				.filter(unit => !isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Battlemage, [BonusKey.AbilityPower, ap]))
		},
	},

	[AugmentGroupKey.BlueBattery]: {
		apply: (augment, team, units) => {
			const [manaRestore] = getVariables(augment, BonusKey.ManaRestore)
			units.forEach(unit => unit.addBonuses(AugmentGroupKey.BlueBattery, [BonusKey.ManaRestore, manaRestore]))
		},
	},

	[AugmentGroupKey.BuiltDifferent]: {
		apply: (augment, team, units) => {
			const [hp, attackSpeed] = getVariables(augment, BonusKey.Health, BonusKey.AttackSpeed)
			units
				.filter(unit => unit.activeSynergies.length === 0)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.BuiltDifferent, [BonusKey.Health, hp], [BonusKey.AttackSpeed, attackSpeed]))
		},
	},

	[AugmentGroupKey.CelestialBlessing]: {
		damageDealtByHolder: (augment, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (!isOriginalSource || (sourceType !== DamageSourceType.attack && sourceType !== DamageSourceType.spell)) {
				return
			}
			const [omnivamp, maxShield] = getVariables(augment, 'Omnivamp', 'MaxShield')
			const heal = takingDamage * omnivamp / 100
			const overheal = holder.gainHealth(elapsedMS, holder, heal, true)
			if (overheal > 0) {
				const id = augment.name
				const shield = holder.shields.find(shield => shield.id === id)
				if (shield) {
					shield.amount = Math.min(maxShield, shield.amount + overheal)
					shield.activated = true
				} else {
					holder.queueShield(0, holder, {
						id,
						amount: overheal,
					})
				}
			}
		},
	},

	[AugmentGroupKey.ChemicalOverload]: {
		onDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Chemtech)) { return }

			const [hpPercent] = getVariables(augment, BonusKey.Health)
			dead.queueHexEffect(elapsedMS, undefined, {
				hexDistanceFromSource: 2,
				damageCalculation: createDamageCalculation(AugmentGroupKey.ChemicalOverload, hpPercent, DamageType.magic, BonusKey.Health, false, 0.01),
			})
		},
	},

	[AugmentGroupKey.CyberneticImplants]: {
		apply: (augment, team, units) => {
			const [hp, ad] = getVariables(augment, BonusKey.Health, BonusKey.AttackDamage)
			units
				.filter(unit => unit.items.length)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.CyberneticImplants, [BonusKey.Health, hp], [BonusKey.AttackDamage, ad]))
		},
	},
	[AugmentGroupKey.CyberneticShell]: {
		apply: (augment, team, units) => {
			const [hp, armor] = getVariables(augment, 'Health', 'Resists') //TODO normalize 'Health'
			units
				.filter(unit => unit.items.length)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.CyberneticImplants, [BonusKey.Health, hp], [BonusKey.Armor, armor]))
		},
	},
	[AugmentGroupKey.CyberneticUplink]: {
		apply: (augment, team, units) => {
			const [hp, manaRegen] = getVariables(augment, 'Health', 'ManaRegen') //TODO normalize 'Health'
			units
				.filter(unit => unit.items.length)
				.forEach(unit => {
					unit.addBonuses(AugmentGroupKey.CyberneticImplants, [BonusKey.Health, hp])
					unit.scalings.add({
						source: unit,
						sourceID: AugmentGroupKey.CyberneticUplink,
						activatedAtMS: 0,
						stats: [BonusKey.Mana],
						intervalAmount: manaRegen,
						intervalSeconds: 1,
					})
				})
		},
	},

	[AugmentGroupKey.DoubleTrouble]: {
		apply: (augment, team, units) => {
			const [bonusStats] = getVariables(augment, 'BonusStats')
			units
				.filter(unit => units.filter(u => u.name === unit.name).length === 2)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.DoubleTrouble, [BonusKey.AttackDamage, bonusStats], [BonusKey.AbilityPower, bonusStats], [BonusKey.Armor, bonusStats], [BonusKey.MagicResist, bonusStats]))
		},
	},

	[AugmentGroupKey.Exiles]: {
		apply: (augment, team, units) => {
			const [durationSeconds, maxHPPercentMultiplier] = getVariables(augment, 'ShieldDuration', 'MaxHealthShield')
			units
				.filter(unit => {
					const adjacentHexes = getHexRing(unit.startHex)
					return !units.some(unit => unit.isIn(adjacentHexes))
				})
				.forEach(unit => unit.queueShield(0, unit, {
					amount: unit.healthMax * maxHPPercentMultiplier / 100,
					expiresAfterMS: durationSeconds * 1000,
				}))
		},
	},

	[AugmentGroupKey.Featherweights]: {
		apply: (augment, team, units) => {
			const [attackSpeed, moveSpeed] = getVariables(augment, 'AttackSpeed', BonusKey.MoveSpeed) //TODO normalize 'AttackSpeed'
			units
				.filter(unit => unit.data.cost != null && unit.data.cost <= 2)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Featherweights, [BonusKey.AttackSpeed, attackSpeed], [BonusKey.MoveSpeed, moveSpeed]))
		},
	},

	[AugmentGroupKey.FirstAidKit]: {
		apply: (augment, team, units) => {
			const [healShieldBoost] = getVariables(augment, 'HealShieldIncrease')
			units.forEach(unit => unit.addBonuses(AugmentGroupKey.FirstAidKit, [BonusKey.HealShieldBoost, healShieldBoost]))
		},
	},

	[AugmentGroupKey.Hexnova]: {
		hpThreshold: (augment, elapsedMS, unit) => {
			if (!unit.hasTrait(TraitKey.Hextech)) { return }
			const [manaReave] = getVariables(augment, 'PercentManaReave')
			const hexRange = 2 //NOTE hardcoded
			unit.queueHexEffect(elapsedMS, undefined, {
				hexDistanceFromSource: hexRange,
				bonuses: [AugmentGroupKey.Hexnova, [BonusKey.ManaReductionPercent, -manaReave]],
			})
		},
	},

	[AugmentGroupKey.InstantInjection]: {
		apply: (augment, team, units) => {
			const synergy = getters.synergiesByTeam.value[team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Chemtech)
			if (synergy?.activeEffect) {
				units
					.filter(unit => unit.hasTrait(TraitKey.Chemtech))
					.forEach(unit => applyChemtech(0, synergy.activeEffect!, unit))
			}
		},
	},

	[AugmentGroupKey.IrresistibleCharm]: {
		apply: (augment, team, units) => {
			const [damageReduction] = getVariables(augment, BonusKey.DamageReduction)
			units
				.filter(unit => unit.hasTrait(TraitKey.Debonair))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.IrresistibleCharm, [BonusKey.DamageReduction, damageReduction / 100]))
		},
	},

	[AugmentGroupKey.KnifesEdge]: {
		apply: (augment, team, units) => {
			const [adPerStar] = getVariables(augment, 'ADPerStarLevel')
			units
				.filter(unit => !isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.KnifesEdge, [BonusKey.AttackDamage, adPerStar * unit.starLevel]))
		},
	},

	[AugmentGroupKey.MakeshiftArmor]: {
		apply: (augment, team, units) => {
			const [resists] = getVariables(augment, 'Resists')
			units
				.filter(unit => !unit.items.length)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.MakeshiftArmor, [BonusKey.Armor, resists], [BonusKey.MagicResist, resists]))
		},
	},
	[AugmentGroupKey.Meditation]: {
		apply: (augment, team, units) => {
			const [manaRegen] = getVariables(augment, 'ManaRegen')
			units
				.filter(unit => !unit.items.length)
				.forEach(unit => unit.scalings.add({
					source: unit,
					sourceID: AugmentGroupKey.Meditation,
					activatedAtMS: 0,
					stats: [BonusKey.Mana],
					intervalAmount: manaRegen,
					intervalSeconds: 1,
				}))
		},
	},

	[AugmentGroupKey.Overpower]: {
		damageDealtByHolder: (augment, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (!isOriginalSource || sourceType !== DamageSourceType.attack) {
				return
			}
			const [critBonus] = getVariables(augment, BonusKey.CritChance)
			const id = AugmentGroupKey.Overpower
			if (holder.basicAttackCount % 3 === 0 && !Array.from(holder.empoweredAutos).some(empoweredAuto => empoweredAuto.id === id)) {
				holder.empoweredAutos.add({
					id,
					amount: 1,
					critBonus,
				})
			}
		},
	},

	[AugmentGroupKey.Phalanx]: {
		apply: (augment, team, units) => {
			const [resists] = getVariables(augment, 'Resists')
			units
				.filter(unit => isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Phalanx, [BonusKey.Armor, resists], [BonusKey.MagicResist, resists]))
		},
	},

	[AugmentGroupKey.RunicShield]: {
		apply: (augment, team, units) => {
			const [durationSeconds, apMultiplier] = getVariables(augment, 'ShieldDuration', 'APShield')
			units
				.filter(unit => unit.hasTrait(TraitKey.Arcanist))
				.forEach(unit => unit.queueShield(0, unit, {
					amount: unit.abilityPower() * apMultiplier / 100,
					expiresAfterMS: durationSeconds * 1000,
				}))
		},
	},

	[AugmentGroupKey.SecondWind]: {
		delayed: (augment, elapsedMS, team, units) => {
			const [healPercent] = getVariables(augment, 'HealPercent')
			units.forEach(unit => unit.gainHealth(elapsedMS, undefined, unit.missingHealth() * healPercent / 100, true))
		},
	},

	[AugmentGroupKey.ShrugItOff]: {
		apply: (augment, team, units) => {
			const [maxHPPercentMultiplier] = getVariables(augment, 'RegenPerTick')
			units
				.filter(unit => unit.hasTrait(TraitKey.Bruiser))
				.forEach(unit => unit.scalings.add({
					source: unit,
					sourceID: AugmentGroupKey.ShrugItOff,
					activatedAtMS: 0,
					stats: [BonusKey.Health],
					intervalAmount: unit.healthMax * maxHPPercentMultiplier / 100,
					intervalSeconds: 1,
				}))
		},
	},

	[AugmentGroupKey.SnipersNest]: {
		apply: (augment, team, units) => {
			const [damageAmpPerRound, maxAmp] = getVariables(augment, 'DamageAmp', 'MaxAmp')
			units
				.filter(unit => unit.hasTrait(TraitKey.Sniper))
				.forEach(unit => {
					const roundsFromSameHex = 4 //NOTE custom UI
					const damageAmp = Math.min(maxAmp, damageAmpPerRound * roundsFromSameHex)
					unit.addBonuses(AugmentGroupKey.SoSmall, [BonusKey.DamageIncrease, damageAmp / 100])
				})
		},
	},

	[AugmentGroupKey.SoSmall]: {
		apply: (augment, team, units) => {
			const [dodgeIncrease] = getVariables(augment, 'DodgeIncrease')
			units
				.filter(unit => unit.hasTrait(TraitKey.Yordle))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.SoSmall, [BonusKey.DodgeChance, dodgeIncrease]))
		},
	},

	[AugmentGroupKey.SpellBlade]: {
		cast: (augment, elapsedMS, unit) => {
			if (!unit.hasTrait(TraitKey.Arcanist)) { return }

			const [apMultiplier] = getVariables(augment, 'PercentAbilityPower')
			unit.empoweredAutos.add({
				amount: 1,
				damageCalculation: createDamageCalculation(AugmentGroupKey.SpellBlade, apMultiplier, DamageType.magic, BonusKey.AbilityPower, false, 0.01),
			})
		},
	},

	[AugmentGroupKey.StandUnited]: {
		apply: (augment, team, units) => {
			const [baseADAP] = getVariables(augment, 'Resists')
			const bonusADAP = baseADAP * getters.synergiesByTeam.value[team].filter(({ activeEffect }) => !!activeEffect).length
			units.forEach(unit => unit.addBonuses(AugmentGroupKey.StandUnited, [BonusKey.AbilityPower, bonusADAP], [BonusKey.AttackDamage, bonusADAP]))
		},
	},

	[AugmentGroupKey.StoredPower]: {
		apply: (augment, team, units) => {
			const [ap] = getVariables(augment, BonusKey.AbilityPower)
			units.forEach(unit => {
				const hextechSynergy = unit.activeSynergies.find(({ key }) => key === TraitKey.Hextech)
				if (hextechSynergy) {
					const { activeEffect } = hextechSynergy
					if (activeEffect) {
						const [frequency] = getVariables(activeEffect, 'Frequency')
						unit.scalings.add({
							sourceID: AugmentGroupKey.StoredPower,
							source: unit,
							activatedAtMS: 0,
							stats: [BonusKey.AbilityPower],
							intervalAmount: ap,
							intervalSeconds: frequency,
						})
					}
				}
			})
		},
	},

	[AugmentGroupKey.SunfireBoard]: {
		apply: (augment, team, units) => {
			getUnitsOfTeam(1 - team as TeamNumber).forEach(target => applyGrievousBurn(augment, 0, target, undefined, 1))
		},
	},

	[AugmentGroupKey.ThrillOfTheHunt]: {
		enemyDeath: (augment, elapsedMS, dead, source) => {
			const [heal] = getVariables(augment, 'MissingHPHeal')
			source?.gainHealth(elapsedMS, source, heal, true)
		},
	},

	[AugmentGroupKey.TitanicForce]: {
		startOfFight: (augment, team, units) => {
			const [hpThreshold, hpMultiplier] = getVariables(augment, 'HealthThreshold', 'HealthPercent')
			units
				.filter(unit => unit.healthMax >= hpThreshold)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.TitanicForce, [BonusKey.AttackDamage, unit.healthMax * hpMultiplier]))
		},
	},

	[AugmentGroupKey.TriForce]: {
		apply: (augment, team, units) => {
			const [hp, attackSpeed, startingMana] = getVariables(augment, 'Health', 'AttackSpeed', 'Mana')
			units
				.filter(unit => unit.data.cost === 3)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.TriForce, [BonusKey.Health, hp], [BonusKey.AttackSpeed, attackSpeed], [BonusKey.Mana, startingMana]))
		},
	},

	[AugmentGroupKey.ChallengerUnity]: {
		teamWideTrait: TraitKey.Challenger,
	},
	[AugmentGroupKey.ChemtechUnity]: {
		teamWideTrait: TraitKey.Chemtech,
	},
	[AugmentGroupKey.HextechUnity]: {
		teamWideTrait: TraitKey.Hextech,
	},

	[AugmentGroupKey.UnstableEvolution]: {
		apply: (augment, team, units) => {
			const variables = getVariables(augment, 'BonusHP', 'BonusAS', 'BonusAD', 'BonusAP')
			const [hp, attackSpeed, ad, ap] = variables
			units
				.filter(unit => unit.hasTrait(TraitKey.Mutant))
				.forEach(unit => {
					const multiplier = unit.starLevel / variables.length //TODO custom UI
					unit.addBonuses(AugmentGroupKey.UnstableEvolution, [BonusKey.Health, hp * multiplier], [BonusKey.AttackSpeed, attackSpeed * multiplier], [BonusKey.AttackDamage, ad * multiplier], [BonusKey.AbilityPower, ap * multiplier])
				})
		},
	},

	[AugmentGroupKey.VerdantVeil]: {
		apply: (augment, team, units) => {
			const [durationSeconds] = getVariables(augment, 'Duration')
			units.forEach(unit => unit.queueShield(0, unit, {
				amount: 0,
				isSpellShield: true,
				expiresAfterMS: durationSeconds * 1000,
			}))
		},
	},

	[AugmentGroupKey.WoodlandCharm]: {
		startOfFight: (augment, team, units) => {
			spawnWoodlands(1, augment, units, (unit) => unit.healthMax)
		},
	},
	[AugmentGroupKey.WoodlandTrinket]: {
		startOfFight: (augment, team, units) => {
			spawnWoodlands(2, augment, units, (unit) => unit.attackSpeed())
		},
	},

} as {[key in AugmentGroupKey]?: AugmentFns}

function spawnWoodlands(cloneCount: number, augment: AugmentData, units: ChampionUnit[], valueFn: (unit: ChampionUnit) => number) {
	const bestUnit = getBestAsMax(true, units, valueFn)
	if (bestUnit) {
		const [cloneHealth] = getVariables(augment, 'CloneHealth')
		for (let index = 0; index < cloneCount; index += 1) {
			const clone = spawnUnit(bestUnit, bestUnit.name, bestUnit.starLevel)
			clone.health = cloneHealth
			clone.healthMax = cloneHealth
			clone.traits = [] //TODO verify what bonuses apply to clones
			clone.activeSynergies = []
			clone.bonuses = []
			clone.scalings.clear()
			clone.shields = []
			clone.pendingBonuses.clear()
		}
	}
}
