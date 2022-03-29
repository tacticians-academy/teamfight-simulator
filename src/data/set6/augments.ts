import { AugmentGroupKey, TraitKey, BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ChampionKey } from '@tacticians-academy/academy-library'

import { getUnitsInSocialiteHexes, INNOVATION_NAMES } from '#/data/set6/utils'
import { applyChemtech } from '#/data/set6/traits'

import type { AttackBounce } from '#/game/effects/GameEffect'
import { delayUntil } from '#/game/loop'
import { getters, state } from '#/game/store'

import { applyGrievousBurn, checkCooldown, getAliveUnitsOfTeamWithTrait, getUnitsOfTeam, getVariables, spawnClones } from '#/helpers/abilityUtils'
import { getHexRing, isInBackLines, getFrontBehindHexes } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { DamageSourceType, SpellKey, StatusEffectType } from '#/helpers/types'
import type { AugmentEffects, TeamNumber } from '#/helpers/types'

export const baseAugmentEffects = {

	[AugmentGroupKey.ArdentCenser]: {
		onHealShield: (augment, elapsedMS, amount, target, source) => {
			if (source.hasTrait(TraitKey.Enchanter) && checkCooldown(elapsedMS, target, augment, augment.name, true, 'CD')) {
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
			if (!unit.hasTrait(TraitKey.Colossus)) { return }
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
			if (!synergy) { return }

			const [bodyguardArmor] = getVariables(synergy.activeEffect!, 'BonusArmor')
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
				window.setTimeout(() => {
					sampleBodyguard.queueHexEffect(0, undefined, {
						targetTeam: sampleBodyguard.team,
						hexes: behindHexes,
					})
				})
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
		allyDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Chemtech)) { return }

			const [hpPercent] = getVariables(augment, BonusKey.Health)
			dead.queueHexEffect(elapsedMS, undefined, {
				hexDistanceFromSource: 2,
				damageCalculation: createDamageCalculation(AugmentGroupKey.ChemicalOverload, hpPercent, DamageType.magic, BonusKey.Health, false, 0.01),
			})
		},
	},

	[AugmentGroupKey.Cutthroat]: {
		damageDealtByHolder: (augment, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (!holder.hasTrait(TraitKey.Assassin)) { return }
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
			const [bonusHealth] = getVariables(augment, 'BonusHealth')
			getUnitsInSocialiteHexes(team, units).forEach(([multiplier, units]) => units.forEach(unit => unit.addBonuses(AugmentGroupKey.Duet, [BonusKey.Health, bonusHealth])))
		},
	},
	[AugmentGroupKey.ShareTheSpotlight]: {
		// See `#/data/set6/traits#[TraitKey.Socialite]`
	},

	[AugmentGroupKey.EnGarde]: {
		damageDealtByHolder: (augment, elapsedMS, isOriginalSource, target, holder, sourceType, rawDamage, takingDamage, damageType) => {
			if (!holder.hasTrait(TraitKey.Challenger)) { return }
			if (!target.hitBy.includes(holder.instanceID)) {
				const [disarmSeconds] = getVariables(augment, 'DisarmDuration')
				target.applyStatusEffect(elapsedMS, StatusEffectType.disarm, disarmSeconds * 1000)
			}
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

	[AugmentGroupKey.OneForAll]: {
		allyDeath: (augment, elapsedMS, dead, source) => {
			if (!dead.hasTrait(TraitKey.Syndicate)) { return }
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
			if (!INNOVATION_NAMES.includes(dead.name as ChampionKey)) {
				return
			}
			if (getAliveUnitsOfTeamWithTrait(dead.team, TraitKey.Innovator).length) {
				const [resurrectSeconds] = getVariables(augment, '{357f0e55}') //TODO rename
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
			if (!unit.hasTrait(TraitKey.Assassin)) { return }
			const stealthMS = 1 * 1000 //TODO experimentally determine
			unit.clearNegativeEffects()
			unit.applyStatusEffect(elapsedMS, StatusEffectType.stealth, stealthMS)
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

	[AugmentGroupKey.WoodlandCharm]: {
		startOfFight: (augment, team, units) => {
			spawnClones(1, augment, units, (unit) => unit.healthMax)
		},
	},

} as AugmentEffects
