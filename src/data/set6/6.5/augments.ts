import { AugmentGroupKey, BonusKey, DamageType, TraitKey } from '@tacticians-academy/academy-library'

import { state } from '#/game/store'

import { getVariables, spawnClones } from '#/helpers/abilityUtils'
import { getHexRing, getClosestAttackableOfTeam, isInBackLines } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { DamageSourceType } from '#/helpers/types'
import type { AugmentEffects } from '#/helpers/types'
import { randomItem } from '#/helpers/utils'

import { baseAugmentEffects } from '../augments'

export const augmentEffects = {

	...baseAugmentEffects,

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

	[AugmentGroupKey.Disintegrator]: {
		damageDealtByHolder: (augment, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (!isOriginalSource || sourceType !== DamageSourceType.attack) {
				return
			}
			const [maxHPPercent] = getVariables(augment, 'MaxHPDamage')
			const bonusCalculation = createDamageCalculation(AugmentGroupKey.Disintegrator, maxHPPercent, DamageType.magic, BonusKey.Health, true, 0.01)
			target.takeBonusDamage(elapsedMS, holder, bonusCalculation, false)
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

	[AugmentGroupKey.IrresistibleCharm]: {
		apply: (augment, team, units) => {
			const [damageReduction] = getVariables(augment, BonusKey.DamageReduction)
			units
				.filter(unit => unit.hasTrait(TraitKey.Debonair))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.IrresistibleCharm, [BonusKey.DamageReduction, damageReduction / 100]))
		},
	},

	[AugmentGroupKey.JeweledLotus]: {
		apply: (augment, team, units) => {
			const [critChance] = getVariables(augment, BonusKey.CritChance)
			units.forEach(unit => unit.setBonusesFor(AugmentGroupKey.JeweledLotus, [BonusKey.CritChance, critChance]))
		},
	},

	[AugmentGroupKey.Keepers]: {
		apply: (augment, team, units) => {
			const [amount, durationSeconds] = getVariables(augment, 'ShieldHealth', 'ShieldDuration')
			units.forEach(source => {
				const adjacentHexes = getHexRing(source.startHex)
				units
					.filter(adjacentUnit => adjacentUnit.isIn(adjacentHexes))
					.forEach(adjacentUnit => adjacentUnit.queueShield(0, source, {
						amount,
						expiresAfterMS: durationSeconds * 1000,
					}))
			})
		},
	},

	[AugmentGroupKey.LudensEcho]: {
		onFirstEffectTargetHit: (augment, elapsedMS, target, source, damageType) => {
			if (damageType !== DamageType.magic) { return }

			const [magicDamage] = getVariables(augment, 'MagicDamage')
			const targets = [target]
			const nearestToTarget = getClosestAttackableOfTeam(target.team, target, state.units)
			if (nearestToTarget.length) {
				targets.push(randomItem(nearestToTarget)!)
			}
			targets.forEach(unit => target.queueProjectileEffect(elapsedMS, undefined, {
				target: unit,
				damageCalculation: createDamageCalculation(AugmentGroupKey.LudensEcho, magicDamage, DamageType.magic),
				damageSourceType: DamageSourceType.bonus,
				missile: {
					speedInitial: 1000,
					// travelTime: 1, //TODO
				},
			}))
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
			if (!holder.hasTrait(TraitKey.Striker)) { return }
			if (!isOriginalSource || sourceType !== DamageSourceType.attack) {
				return
			}
			const [critChance] = getVariables(augment, BonusKey.CritChance)
			const id = AugmentGroupKey.Overpower
			if (holder.basicAttackCount % 3 === 0 && !Array.from(holder.empoweredAutos).some(empoweredAuto => empoweredAuto.id === id)) {
				holder.empoweredAutos.add({
					id,
					amount: 1,
					damageModifier: {
						critChance,
					},
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

	[AugmentGroupKey.SecondWind]: {
		delayed: (augment, elapsedMS, team, units) => {
			const [healPercent] = getVariables(augment, 'HealPercent')
			units.forEach(unit => unit.gainHealth(elapsedMS, undefined, unit.missingHealth() * healPercent / 100, true))
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
			units.forEach(unit => unit.queueShield(0, unit, {
				amount: 0,
				isSpellShield: true,
				expiresAfterMS: durationSeconds * 1000,
			}))
		},
	},

	[AugmentGroupKey.WoodlandTrinket]: {
		startOfFight: (augment, team, units) => {
			spawnClones(2, augment, units, (unit) => unit.attackSpeed())
		},
	},

} as AugmentEffects
