import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { applyChemtech } from '#/data/set6/traits'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { getters } from '#/game/store'

import { getVariables } from '#/helpers/abilityUtils'
import { getHexRing, isInBackLines } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import type { TeamNumber } from '#/helpers/types'

export interface AugmentFns {
	teamWideTrait?: TraitKey
	apply?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	cast?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	onDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit) => void
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit) => void
}

export default {

	[AugmentGroupKey.ArchangelsEmbrace]: {
		cast: (augment, elapsedMS, unit) => {
			const [manaPercent] = getVariables(augment, 'ManaPercent')
			unit.addBonuses(AugmentGroupKey.ArchangelsEmbrace, [BonusKey.AbilityPower, unit.manaMax() * manaPercent / 100])
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

	[AugmentGroupKey.ChemicalOverload]: {
		onDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Chemtech)) { return }

			const [hpPercent] = getVariables(augment, BonusKey.Health)
			dead.queueHexEffect(elapsedMS, undefined, {
				hexDistanceFromSource: 2,
				damageCalculation: createDamageCalculation(AugmentGroupKey.ChemicalOverload, hpPercent, DamageType.magic, BonusKey.Health, 0.01),
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

	[AugmentGroupKey.Exiles]: {
		apply: (augment, team, units) => {
			const [durationSeconds, maxHPPercentMultiplier] = getVariables(augment, 'ShieldDuration', 'MaxHealthShield')
			units
				.filter(unit => {
					const adjacentHexes = getHexRing(unit.startHex)
					return !units.some(unit => unit.isIn(adjacentHexes))
				})
				.forEach(unit => unit.shields.push({
					source: unit,
					amount: unit.healthMax * maxHPPercentMultiplier / 100,
					expiresAtMS: durationSeconds * 1000,
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

	[AugmentGroupKey.DoubleTrouble]: {
		apply: (augment, team, units) => {
			const [bonusStats] = getVariables(augment, 'BonusStats')
			units
				.filter(unit => units.filter(u => u.name === unit.name).length === 2)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.DoubleTrouble, [BonusKey.AttackDamage, bonusStats], [BonusKey.AbilityPower, bonusStats], [BonusKey.Armor, bonusStats], [BonusKey.MagicResist, bonusStats]))
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
				.forEach(unit => unit.shields.push({
					source: unit,
					amount: unit.abilityPower() * apMultiplier / 100,
					expiresAtMS: durationSeconds * 1000,
				}))
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
				damageCalculation: createDamageCalculation(AugmentGroupKey.SpellBlade, apMultiplier, DamageType.magic, BonusKey.AbilityPower, 0.01),
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

	[AugmentGroupKey.ThrillOfTheHunt]: {
		enemyDeath: (augment, elapsedMS, dead, source) => {
			const [heal] = getVariables(augment, 'MissingHPHeal')
			source.gainHealth(elapsedMS, source, heal, true)
		},
	},

	[AugmentGroupKey.TitanicForce]: {
		apply: (augment, team, units) => {
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

	[AugmentGroupKey.VerdantVeil]: {
		apply: (augment, team, units) => {
			const [durationSeconds] = getVariables(augment, 'Duration')
			units.forEach(unit => unit.shields.push({
				source: unit,
				amount: 0,
				isSpellShield: true,
				expiresAtMS: durationSeconds * 1000,
			}))
		},
	},

} as {[key in AugmentGroupKey]?: AugmentFns}
