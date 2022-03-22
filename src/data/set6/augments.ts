import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'

import type { ChampionUnit } from '#/game/ChampionUnit'
import type { TeamNumber } from '#/helpers/types'
import { getters } from '#/game/store'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'
import { createDamageCalculation } from '#/helpers/calculate'
import { getHexRing, isInBackLines } from '#/helpers/boardUtils'
import { BOARD_ROW_COUNT } from '#/helpers/constants'

export interface AugmentFns {
	apply?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	cast?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit) => void
}

export default {

	[AugmentGroupKey.Backfoot]: {
		apply: (augment, team, units) => {
			const attackSpeed = augment.effects[BonusKey.AttackSpeed]
			if (attackSpeed == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Backfoot, [BonusKey.AttackSpeed, attackSpeed * 100]))
		},
	},

	[AugmentGroupKey.Battlemage]: {
		apply: (augment, team, units) => {
			const ap = augment.effects[BonusKey.AbilityPower]
			if (ap == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => !isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Battlemage, [BonusKey.AbilityPower, ap]))
		},
	},

	[AugmentGroupKey.BlueBattery]: {
		apply: (augment, team, units) => {
			const manaRestore = augment.effects['ManaRestore']
			if (manaRestore == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units.forEach(unit => unit.addBonuses(AugmentGroupKey.BlueBattery, [BonusKey.ManaRestore, manaRestore]))
		},
	},

	[AugmentGroupKey.CyberneticImplants]: {
		apply: (augment, team, units) => {
			const hp = augment.effects[BonusKey.Health]
			const ad = augment.effects[BonusKey.AttackDamage]
			if (hp == null || ad == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.items.length)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.CyberneticImplants, [BonusKey.Health, hp], [BonusKey.AttackDamage, ad]))
		},
	},
	[AugmentGroupKey.CyberneticShell]: {
		apply: (augment, team, units) => {
			const hp = augment.effects['Health'] //TODO normalize
			const armor = augment.effects['Resists']
			if (hp == null || armor == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.items.length)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.CyberneticImplants, [BonusKey.Health, hp], [BonusKey.Armor, armor]))
		},
	},
	[AugmentGroupKey.CyberneticUplink]: {
		apply: (augment, team, units) => {
			const hp = augment.effects['Health'] //TODO normalize
			const manaRegen = augment.effects['ManaRegen']
			if (hp == null || manaRegen == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
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
			const maxHPPercentMultiplier = augment.effects['MaxHealthShield']
			const durationSeconds = augment.effects['ShieldDuration']
			if (maxHPPercentMultiplier == null || durationSeconds == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
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
			const attackSpeed = augment.effects['AttackSpeed'] //TODO normalize
			const moveSpeed = augment.effects[BonusKey.MoveSpeed] //TODO verify
			if (attackSpeed == null || moveSpeed == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.data.cost != null && unit.data.cost <= 2)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Featherweights, [BonusKey.AttackSpeed, attackSpeed], [BonusKey.MoveSpeed, moveSpeed]))
		},
	},

	[AugmentGroupKey.DoubleTrouble]: {
		apply: (augment, team, units) => {
			const bonusStats = augment.effects['BonusStats']
			if (bonusStats == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => units.filter(u => u.name === unit.name).length === 2)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.DoubleTrouble, [BonusKey.AttackDamage, bonusStats], [BonusKey.AbilityPower, bonusStats], [BonusKey.Armor, bonusStats], [BonusKey.MagicResist, bonusStats]))
		},
	},

	[AugmentGroupKey.KnifesEdge]: {
		apply: (augment, team, units) => {
			const adPerStar = augment.effects['ADPerStarLevel']
			if (adPerStar == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => !isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.KnifesEdge, [BonusKey.AttackDamage, adPerStar * unit.starLevel]))
		},
	},

	[AugmentGroupKey.Meditation]: {
		apply: (augment, team, units) => {
			const manaRegen = augment.effects['ManaRegen']
			if (manaRegen == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
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
			const resists = augment.effects['Resists']
			if (resists == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => isInBackLines(unit))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.Phalanx, [BonusKey.Armor, resists], [BonusKey.MagicResist, resists]))
		},
	},

	[AugmentGroupKey.RunicShield]: {
		apply: (augment, team, units) => {
			const durationSeconds = augment.effects['ShieldDuration']
			const apMultiplier = augment.effects['APShield']
			if (durationSeconds == null || apMultiplier == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
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
			const maxHPPercentMultiplier = augment.effects['RegenPerTick']
			if (maxHPPercentMultiplier == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
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
			const dodgeIncrease = augment.effects['DodgeIncrease']
			if (dodgeIncrease == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.hasTrait(TraitKey.Yordle))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.SoSmall, [BonusKey.DodgeChance, dodgeIncrease]))
		},
	},

	[AugmentGroupKey.SpellBlade]: {
		cast: (augment, elapsedMS, unit) => {
			if (!unit.hasTrait(TraitKey.Arcanist)) { return }

			const apMultiplier = augment.effects['PercentAbilityPower']
			if (apMultiplier == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			unit.empoweredAutos.add({
				amount: 1,
				damageCalculation: createDamageCalculation(AugmentGroupKey.SpellBlade, apMultiplier, DamageType.magic, BonusKey.AbilityPower, 0.01),
			})
		},
	},

	[AugmentGroupKey.StandUnited]: {
		apply: (augment, team, units) => {
			const baseADAP = augment.effects['Resists']
			if (baseADAP == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			const bonusADAP = baseADAP * getters.synergiesByTeam.value[team].filter(({ activeEffect }) => !!activeEffect).length
			units.forEach(unit => unit.addBonuses(AugmentGroupKey.StandUnited, [BonusKey.AbilityPower, bonusADAP], [BonusKey.AttackDamage, bonusADAP]))
		},
	},

	[AugmentGroupKey.ThrillOfTheHunt]: {
		enemyDeath: (augment, elapsedMS, dead, source) => {
			const heal = augment.effects['MissingHPHeal']
			if (heal == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			source.gainHealth(elapsedMS, source, heal, true)
		},
	},

	[AugmentGroupKey.TitanicForce]: {
		apply: (augment, team, units) => {
			const hpThreshold = augment.effects['HealthThreshold']
			const hpMultiplier = augment.effects['HealthPercent']
			if (hpThreshold == null || hpMultiplier == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.healthMax >= hpThreshold)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.TitanicForce, [BonusKey.AttackDamage, unit.healthMax * hpMultiplier]))
		},
	},

	[AugmentGroupKey.TriForce]: {
		apply: (augment, team, units) => {
			const hp = augment.effects['Health']
			const attackSpeed = augment.effects['AttackSpeed']
			const startingMana = augment.effects['Mana']
			if (hp == null || attackSpeed == null || startingMana == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units
				.filter(unit => unit.data.cost === 3)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.TriForce, [BonusKey.Health, hp], [BonusKey.AttackSpeed, attackSpeed], [BonusKey.Mana, startingMana]))
		},
	},

	[AugmentGroupKey.VerdantVeil]: {
		apply: (augment, team, units) => {
			const durationSeconds = augment.effects['Duration']
			if (durationSeconds == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			units.forEach(unit => unit.shields.push({
				source: unit,
				amount: 0,
				isSpellShield: true,
				expiresAtMS: durationSeconds * 1000,
			}))
		},
	},

} as {[key in AugmentGroupKey]?: AugmentFns}
