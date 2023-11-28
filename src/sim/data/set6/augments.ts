import { AugmentGroupKey, TraitKey, BonusKey, DamageType } from '@tacticians-academy/academy-library'

import { getters, state } from '#/store/store'

import type { AugmentEffects } from '#/sim/data/types'
import { getUnitsInSocialiteHexes, INNOVATION_IDS } from '#/sim/data/set6/utils'
import { applyChemtech } from '#/sim/data/set6/traits'

import { applyGrievousBurn, checkCooldownFor, getAliveUnitsOfTeamWithTrait, getUnitsOfTeam, getVariables, spawnClones } from '#/sim/helpers/effectUtils'
import { getHexRing, isInBackLines, getFrontBehindHexes } from '#/sim/helpers/board'
import { createDamageCalculation } from '#/sim/helpers/calculate'
import type { AttackBounce } from '#/sim/effects/GameEffect'
import { delayUntil } from '#/sim/loop'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/sim/helpers/types'
import type { TeamNumber } from '#/sim/helpers/types'

export const baseAugmentEffects = {

	[AugmentGroupKey.ArdentCenser]: {
		onHealShield: (augment, elapsedMS, amount, target, source) => {
			if (source.hasTrait(TraitKey.Enchanter) && checkCooldownFor(elapsedMS, target, augment, augment.name, true, 'CD')) {
				const [attackSpeed] = getVariables(augment, BonusKey.AttackSpeed)
				target.addBonuses(AugmentGroupKey.ArdentCenser, [BonusKey.AttackSpeed, attackSpeed])
			}
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
			if (!unit.hasTrait(TraitKey.Colossus)) return

			const [invulnerabilitySeconds] = getVariables(augment, 'InvulnDuration')
			unit.applyStatusEffect(elapsedMS, StatusEffectType.invulnerable, invulnerabilitySeconds * 1000)
		},
	},

	[AugmentGroupKey.BrokenStopwatch]: {
		delayed: (augment, elapsedMS, team, units) => {
			const [stunSeconds] = getVariables(augment, 'StunDuration')
			state.units
				.filter(unit => !unit.dead && !unit.hasTrait(TraitKey.Clockwork))
				.forEach(unit => unit.applyStatusEffect(elapsedMS, StatusEffectType.stunned, stunSeconds * 1000))
		},
	},

	[AugmentGroupKey.StandBehindMe]: {
		apply: (augment, team, units) => {
			const synergy = getters.synergiesByTeam.value[team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Bodyguard)
			if (!synergy?.activeEffect) return

			const [bodyguardArmor] = getVariables(synergy.activeEffect, 'BonusArmor')
			const [bodyguardPercent, standBehindPercent] = getVariables(augment, 'DefenseBonus', 'DefensePercent')
			const bodyguards = units.filter(unit => unit.hasTrait(TraitKey.Bodyguard))
			const behindHexes = bodyguards.flatMap(unit => getFrontBehindHexes(unit, false))
			units
				.filter(unit => unit.isIn(behindHexes))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.StandBehindMe, [BonusKey.Armor, bodyguardArmor * standBehindPercent / 100]))
			bodyguards
				.forEach(unit => unit.addBonuses(AugmentGroupKey.StandBehindMe, [BonusKey.Armor, bodyguardArmor * bodyguardPercent / 100]))
			const sampleBodyguard = bodyguards[0]
			if (sampleBodyguard != null) {
				const sampleEffect = sampleBodyguard.queueHexEffect(0, undefined, {
					targetTeam: sampleBodyguard.team,
					hexes: behindHexes,
				})
				sampleEffect.started.value = true
			}
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
		damageDealtByHolder: (augment, elapsedMS, target, holder, { isOriginalSource, sourceType, takingDamage }) => {
			if (!isOriginalSource || (sourceType !== DamageSourceType.attack && sourceType !== DamageSourceType.spell)) return

			const [omnivamp, maxShield] = getVariables(augment, 'Omnivamp', 'MaxShield')
			const heal = takingDamage * omnivamp / 100
			const overheal = holder.gainHealth(elapsedMS, holder, heal, true)
			if (overheal > 0) {
				const id = augment.name
				const shield = holder.shields.find(shield => shield.id === id)
				if (shield) {
					shield.amount = Math.min(maxShield, (shield.amount ?? 0) + overheal)
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
		allyDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Chemtech)) return

			const [hpPercent] = getVariables(augment, BonusKey.Health)
			dead.queueHexEffect(elapsedMS, undefined, {
				hexDistanceFromSource: 2,
				damageCalculation: createDamageCalculation(AugmentGroupKey.ChemicalOverload, hpPercent, DamageType.magic, BonusKey.Health, false, 0.01),
			})
		},
	},

	[AugmentGroupKey.Cutthroat]: {
		damageDealtByHolder: (augment, elapsedMS, target, holder, damage) => {
			if (!holder.hasTrait(TraitKey.Assassin)) return

			if (holder.basicAttackCount === 1) {
				const [manaReductionPercent] = getVariables(augment, 'ManaReavePercent')
				target.addBonuses(SpellKey.ManaReave, [BonusKey.ManaReductionPercent, -manaReductionPercent])
			}
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

	[AugmentGroupKey.Duet]: {
		apply: (augment, team, units) => {
			const [bonusHealth] = getVariables(augment, 'BonusHP')
			getUnitsInSocialiteHexes(team, units).forEach(([multiplier, units]) => units.forEach(unit => unit.addBonuses(AugmentGroupKey.Duet, [BonusKey.Health, bonusHealth])))
		},
	},
	[AugmentGroupKey.ShareTheSpotlight]: {
		// See `#/sim/data/set6/traits#[TraitKey.Socialite]`
	},

	[AugmentGroupKey.EnGarde]: {
		damageDealtByHolder: (augment, elapsedMS, target, holder, damage) => {
			if (!holder.hasTrait(TraitKey.Challenger)) return

			if (!target.hitBy.has(holder.instanceID)) {
				const [disarmSeconds] = getVariables(augment, 'DisarmDuration')
				target.applyStatusEffect(elapsedMS, StatusEffectType.disarm, disarmSeconds * 1000)
			}
		},
	},

	[AugmentGroupKey.Exiles]: {
		apply: (augment, team, units) => {
			const [durationSeconds, maxHPPercentMultiplier] = getVariables(augment, 'ShieldDuration', 'MaxHShield')
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
			const [attackSpeed, moveSpeed] = getVariables(augment, BonusKey.AttackSpeed, BonusKey.MoveSpeed)
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

	[AugmentGroupKey.GoldReserves]: {
		apply: (augment, team, units) => {
			const [maxDamagePercent] = getVariables(augment, 'DamageCap') //NOTE hardcoded to max, but this is virtually always the case for relevant tests
			units
				.filter(unit => unit.hasTrait(TraitKey.Mercenary))
				.forEach(unit => unit.addBonuses(AugmentGroupKey.GoldReserves, [BonusKey.DamageIncrease, maxDamagePercent / 100]))
		},
	},

	[AugmentGroupKey.InstantInjection]: {
		apply: (augment, team, units) => {
			const activeEffect = getters.synergiesByTeam.value[team].find(({ key, activeEffect }) => !!activeEffect && key === TraitKey.Chemtech)?.activeEffect
			if (activeEffect) {
				units
					.filter(unit => unit.hasTrait(TraitKey.Chemtech))
					.forEach(unit => applyChemtech(0, activeEffect, unit))
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

	[AugmentGroupKey.LifelongLearning]: {
		apply: (augment, team, units) => {
			const [ap, bonusAP] = getVariables(augment, BonusKey.AbilityPower, 'BonusAP') //TODO wins vs losses
			units
				.filter(unit => unit.hasTrait(TraitKey.Scholar))
				.forEach(unit => {
					const roundsFought = unit.initStack(AugmentGroupKey.LifelongLearning, {})
					unit.setBonusesFor(AugmentGroupKey.LifelongLearning, [BonusKey.AbilityPower, roundsFought * ap])
				})
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

	[AugmentGroupKey.OneForAll]: {
		allyDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Syndicate)) return

			const [stats] = getVariables(augment, 'Stats')
			getAliveUnitsOfTeamWithTrait(dead.team, TraitKey.Syndicate).forEach(unit => {
				unit.addBonuses(AugmentGroupKey.OneForAll, [BonusKey.AttackDamage, stats], [BonusKey.AbilityPower, stats])
			})
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

	[AugmentGroupKey.SelfRepair]: {
		allyDeath: async (augment, elapsedMS, dead, source) => {
			if (!INNOVATION_IDS.includes(dead.data.apiName)) return

			if (getAliveUnitsOfTeamWithTrait(dead.team, TraitKey.Innovator).length) {
				const [resurrectSeconds] = getVariables(augment, 'RepairDuration')
				dead.resurrecting = true
				await delayUntil(elapsedMS, resurrectSeconds)
				dead.resurrecting = false
				if (getAliveUnitsOfTeamWithTrait(dead.team, TraitKey.Innovator).length) {
					dead.dead = false
					dead.health = dead.healthMax
				}
			}
		},
	},

	[AugmentGroupKey.Sharpshooter]: {
		modifyAttacks: (augment, team, unit) => {
			if (unit.hasTrait(TraitKey.Twinshot)) {
				const [reductionPercent] = getVariables(augment, 'BounceReduction')
				const bounce: AttackBounce = {
					bouncesRemaining: 1,
					damageModifier: {
						multiplier: -reductionPercent / 100,
					},
				}
				return { bounce }
			}
			return {}
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

	[AugmentGroupKey.SmokeBomb]: {
		hpThreshold: (augment, elapsedMS, unit) => {
			if (!unit.hasTrait(TraitKey.Assassin)) return

			const stealthMS = 1 * 1000 //TODO experimentally determine
			unit.clearNegativeEffects()
			unit.applyStatusEffect(elapsedMS, StatusEffectType.stealth, stealthMS)
		},
	},

	[AugmentGroupKey.SnipersNest]: {
		apply: (augment, team, units) => {
			const [damageAmpPerRound, maxAmp] = getVariables(augment, 'DamageAmp', 'MaxAmp')
			const maxStacks = maxAmp / damageAmpPerRound
			units
				.filter(unit => unit.hasTrait(TraitKey.Sniper))
				.forEach(unit => {
					const roundsFromSameHex = unit.initStack(AugmentGroupKey.SnipersNest, { max: maxStacks })
					const damageAmp = damageAmpPerRound * roundsFromSameHex
					unit.addBonuses(AugmentGroupKey.SnipersNest, [BonusKey.DamageIncrease, damageAmp / 100])
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
			if (!unit.hasTrait(TraitKey.Arcanist)) return

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
			const [hpThreshold, hpMultiplier] = getVariables(augment, 'HPThreshold', 'HPPercent')
			units
				.filter(unit => unit.healthMax >= hpThreshold)
				.forEach(unit => unit.addBonuses(AugmentGroupKey.TitanicForce, [BonusKey.AttackDamage, unit.healthMax * hpMultiplier]))
		},
	},

	[AugmentGroupKey.Underdogs]: {
		apply: (augment, team, units) => {
			const [missingHeal, healCap] = getVariables(augment, 'MissingHeal', 'HealCap')
			units.forEach(underdogUnit => underdogUnit.scalings.add({
				source: undefined,
				sourceID: AugmentGroupKey.Underdogs,
				activatedAtMS: 0,
				stats: [BonusKey.Health],
				calculateAmount: (elapsedMS) => {
					const teamUnitCounts = [0, 0]
					state.units.forEach(unit => {
						if (!unit.dead) {
							teamUnitCounts[unit.team] += 1
						}
					})
					if (teamUnitCounts[underdogUnit.team] >= teamUnitCounts[underdogUnit.opposingTeam()]) {
						return 0
					}
					return Math.min(healCap, underdogUnit.missingHealth() * missingHeal / 100)
				},
				intervalSeconds: 1,
			}))
		},
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

	[AugmentGroupKey.Weakspot]: {
		modifyDamageByHolder: (augment, target, source, damage) => {
			if (damage.sourceType === DamageSourceType.attack) { //TODO if isOriginalSource?
				const [armorShredPercent] = getVariables(augment, 'ArmorPenPercent')
				damage[BonusKey.ArmorShred] += armorShredPercent / 100
			}
		},
		damageDealtByHolder: (augment, elapsedMS, target, source, { isOriginalSource, sourceType }) => {
			if (isOriginalSource && sourceType === DamageSourceType.attack) {
				const [durationSeconds, healReductionPercent] = getVariables(augment, SpellKey.Duration, 'HealReductionPercent')
				target.applyStatusEffect(elapsedMS, StatusEffectType.grievousWounds, durationSeconds * 1000, healReductionPercent / 100)
			}
		},
	},

	[AugmentGroupKey.WoodlandCharm]: {
		startOfFight: (augment, team, units) => {
			spawnClones(1, augment, units, (unit) => unit.healthMax)
		},
	},

} as AugmentEffects
