import { markRaw } from 'vue'

import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ChampionData, ChampionSpellData, ItemData, SpellCalculation, TraitData } from '@tacticians-academy/academy-library'

import { champions } from '@tacticians-academy/academy-library/dist/set6/champions'
import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import { TraitKey, traits } from '@tacticians-academy/academy-library/dist/set6/traits'

import itemEffects from '#/data/items'
import championEffects from '#/data/set6/champions'
import traitEffects from '#/data/set6/traits'

import { getNextHex, updatePaths } from '#/game/pathfind'
import { Projectile } from '#/game/Projectile'
import type { ProjectileData } from '#/game/Projectile'
import { HexEffect } from '#/game/HexEffect'
import type { HexEffectData } from '#/game/HexEffect'
import { coordinatePosition, gameOver, state } from '#/game/store'

import { containsHex, getAdjacentRowUnitsTo, getClosestHexAvailableTo, getClosesUnitOfTeamTo, getInverseHex, getNearestEnemies, getSurroundingWithin, hexDistanceFrom, isSameHex } from '#/helpers/boardUtils'
import { calculateItemBonuses, calculateSynergyBonuses, createDamageCalculation, solveSpellCalculationFor } from '#/helpers/bonuses'
import { BACKLINE_JUMP_MS, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT, DEFAULT_MANA_LOCK_MS, HEX_PROPORTION_PER_LEAGUEUNIT, LOCKED_STAR_LEVEL_BY_UNIT_API_NAME } from '#/helpers/constants'
import { saveUnits } from '#/helpers/storage'
import { MutantType, MutantBonus, SpellKey, DamageSourceType } from '#/helpers/types'
import type { BonusLabelKey, BonusScaling, BonusVariable, ChampionFns, HexCoord, StarLevel, TeamNumber, ShieldData, SynergyData } from '#/helpers/types'
import { randomItem } from '#/helpers/utils'

let instanceIndex = 0

export class ChampionUnit {
	instanceID: string
	name: string
	startPosition: HexCoord
	team: TeamNumber = 0
	starLevel: StarLevel
	data: ChampionData

	activePosition: HexCoord
	dead = false
	target: ChampionUnit | null = null // eslint-disable-line no-use-before-define
	mana = 0
	health = 0
	healthMax = 0
	starMultiplier = 1
	isStarLocked: boolean
	fixedAS: number | undefined = undefined
	instantAttack: boolean
	attackSpeedSlow = {
		expiresAt: 0,
		amount: 0,
	}

	collides = true
	interacts = true
	ghosting = false

	banishUntilMS: DOMHighResTimeStamp | null = null
	cachedTargetDistance = 0
	attackStartAtMS: DOMHighResTimeStamp = 0
	moveUntilMS: DOMHighResTimeStamp = 0
	manaLockUntilMS: DOMHighResTimeStamp = 0
	stunnedUntilMS: DOMHighResTimeStamp = 0
	items: ItemData[] = []
	traits: TraitData[] = []
	activeSynergies: SynergyData[] = []
	transformIndex = 0

	nextAttack: SpellCalculation | undefined //TODO
	championEffects: ChampionFns | undefined

	bonuses: [BonusLabelKey, BonusVariable[]][] = []
	scalings = new Set<BonusScaling>()
	shields: ShieldData[] = []

	pending = {
		hexEffects: new Set<HexEffect>(),
		projectiles: new Set<Projectile>(),
	}

	constructor(name: string, position: HexCoord, starLevel: StarLevel) {
		this.instanceID = `c${instanceIndex += 1}`
		const stats = champions.find(unit => unit.name === name) ?? champions[0]
		const starLockedLevel = LOCKED_STAR_LEVEL_BY_UNIT_API_NAME[stats.apiName]
		this.isStarLocked = !!starLockedLevel
		this.data = markRaw(stats)
		this.name = name
		this.starLevel = starLockedLevel ?? starLevel
		this.championEffects = championEffects[name]
		this.instantAttack = this.data.stats.range <= 1
		this.startPosition = position
		this.activePosition = position
		this.reposition(position)
	}

	reset(synergiesByTeam: SynergyData[][]) {
		this.starMultiplier = Math.pow(1.8, this.starLevel - 1)
		this.dead = false
		this.target = null
		this.activePosition = this.startPosition
		this.cachedTargetDistance = 0
		this.attackStartAtMS = 0
		this.moveUntilMS = 0
		this.manaLockUntilMS = 0
		this.stunnedUntilMS = 0
		const jumpToBackline = this.jumpsToBackline()
		this.collides = !jumpToBackline
		this.ghosting = jumpToBackline
		this.interacts = true
		this.banishUntilMS = 0
		if (this.hasTrait(TraitKey.Transformer)) {
			const col = this.activePosition[1]
			this.transformIndex = col >= 2 && col < BOARD_ROW_COUNT - 2 ? 0 : 1
		} else {
			this.transformIndex = 0
		}

		const unitTraitKeys = (this.data.traits as TraitKey[]).concat(this.items.filter(item => item.name.endsWith(' Emblem')).map(item => item.name.replace(' Emblem', '') as TraitKey))
		this.traits = Array.from(new Set(unitTraitKeys)).map(traitKey => traits.find(trait => trait.name === traitKey)).filter((trait): trait is TraitData => trait != null)
		this.activeSynergies = synergiesByTeam[this.team]
		const [synergyTraitBonuses, synergyScalings, synergyShields] = calculateSynergyBonuses(this, this.activeSynergies, unitTraitKeys)
		const [itemBonuses, itemScalings, itemShields] = calculateItemBonuses(this.items)
		this.bonuses = [...synergyTraitBonuses, ...itemBonuses]
		this.scalings = new Set([...synergyScalings, ...itemScalings])
		this.shields = [...synergyShields, ...itemShields]

		this.setMana(this.data.stats.initialMana + this.getBonuses(BonusKey.Mana))
		this.health = this.data.stats.hp * this.starMultiplier + this.getBonusVariants(BonusKey.Health)
		this.healthMax = this.health
		this.fixedAS = this.getSpellVariable(SpellKey.AttackSpeed) //TODO Jhin set data

		this.pending.hexEffects.clear()
		this.pending.projectiles.clear()
	}
	postReset() {
		const banishDuration = this.getBonuses('BanishDuration' as BonusKey)
		if (banishDuration) {
			const targetHex = getInverseHex(this.startPosition)
			const target = getClosesUnitOfTeamTo(targetHex, this.opposingTeam(), state.units) //TODO not random
			if (target) {
				target.banishUntil(banishDuration * 1000)
			}
		}
		for (const item of this.items) {
			const hexRange = item.effects['HexRange']
			if (hexRange != null) {
				const isRowEffect = [ItemKey.BansheesClaw, ItemKey.ChaliceOfPower, ItemKey.LocketOfTheIronSolari, ItemKey.ZekesHerald].includes(item.id)
				if (isRowEffect) {
					const shieldValue = item.effects[`${this.starLevel}StarShieldValue`]
					const shieldDuration = item.effects['ShieldDuration']
					let bonus: BonusVariable | undefined
					let shield: ShieldData | undefined
					if (shieldValue != null && shieldDuration != null) {
						shield = {
							amount: shieldValue,
							expiresAtMS: shieldDuration * 1000,
						}
					} else {
						const attackSpeed = item.effects['AS']
						if (attackSpeed != null) {
							bonus = [BonusKey.AttackSpeed, attackSpeed]
						} else {
							const bonusAP = item.effects['BonusAP']
							if (bonusAP != null) {
								bonus = [BonusKey.AbilityPower, bonusAP]
							} else {
								const damageCap = item.effects['DamageCap']
								if (damageCap != null) {
									shield = {
										isSpellShield: true,
										amount: damageCap,
									}
								} else {
									console.log('ERR missing HexRange row effect', item.name, item.effects)
								}
							}
						}
					}

					const buffedUnits = getAdjacentRowUnitsTo(hexRange, this.startPosition, state.units)
					if (bonus != null) {
						const buffBonus = bonus
						buffedUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, buffBonus))
					} else if (shield != null) {
						const buffShield = shield
						buffedUnits.push(this)
						buffedUnits.forEach(unit => unit.shields.push(buffShield))
					}
				}
			}
		}
	}

	addBonuses(key: BonusLabelKey, ...bonuses: BonusVariable[]) {
		this.bonuses.push([key, bonuses])
	}

	updateTarget() {
		if (this.target != null) {
			const targetDistance = this.hexDistanceTo(this.target)
			if (!this.target.isAttackable() || targetDistance > this.range()) {
				this.target = null
			} else {
				this.cachedTargetDistance = targetDistance
			}
		}
		if (this.target == null) {
			const targets = getNearestEnemies(this, state.units)
			if (targets.length) {
				this.target = randomItem(targets)! //TODO random
				this.cachedTargetDistance = this.hexDistanceTo(this.target)
				// console.log(this.name, this.team, 'targets at', this.cachedTargetDistance, 'hexes', this.target.name, this.target.team)
			}
		}
	}

	updateAttack(elapsedMS: DOMHighResTimeStamp) {
		if (this.target == null) {
			return
		}
		let attackSpeed = this.attackSpeed()
		if (elapsedMS < this.attackSpeedSlow.expiresAt) {
			attackSpeed *= 1 - this.attackSpeedSlow.amount / 100
		}
		const msBetweenAttacks = 1000 / attackSpeed
		if (elapsedMS < this.attackStartAtMS + msBetweenAttacks) {
			return
		}
		if (this.attackStartAtMS <= 0) {
			this.attackStartAtMS = elapsedMS
		} else {
			const canReProcAttack = this.attackStartAtMS > 1
			const damageCalculation = createDamageCalculation(BonusKey.AttackDamage, 1, undefined, BonusKey.AttackDamage, 1)
			const passiveFn = this.championEffects?.passive
			if (this.instantAttack) {
				this.target.damage(elapsedMS, true, this, DamageSourceType.attack, damageCalculation, undefined, false)
				this.attackStartAtMS = elapsedMS
				passiveFn?.(elapsedMS, this.target, this)
			} else {
				const source = this
				this.queueProjectile(elapsedMS, undefined, {
					startsAfterMS: msBetweenAttacks / 4, //TODO from data
					missile: {
						speedInitial: this.data.basicAttackMissileSpeed ?? this.data.critAttackMissileSpeed ?? 1000, //TODO crits
					},
					sourceType: DamageSourceType.attack,
					target: this.target,
					damageCalculation,
					onCollision(elapsedMS, unit) {
						passiveFn?.(elapsedMS, unit, source)
					},
				})
			}
			this.gainMana(elapsedMS, 10 + this.getBonuses('FlatManaRestore' as BonusKey))

			this.items.forEach(item => itemEffects[item.id as ItemKey]?.basicAttack?.(item, this.target!, this, canReProcAttack))
			this.activeSynergies.forEach(([trait, style, activeEffect]) => traitEffects[trait.name as TraitKey]?.basicAttack?.(activeEffect!, this.target!, this, canReProcAttack))
		}
	}

	updateRegen(elapsedMS: DOMHighResTimeStamp) {
		this.scalings.forEach(scaling => {
			if (scaling.activatedAt === 0) {
				scaling.activatedAt = elapsedMS
				return
			}
			if (scaling.expiresAfter != null && scaling.activatedAt + scaling.expiresAfter >= elapsedMS) {
				this.scalings.delete(scaling)
				return
			}
			if (elapsedMS < scaling.activatedAt + scaling.intervalSeconds * 1000) {
				return
			}
			scaling.activatedAt = elapsedMS
			const bonuses: BonusVariable[] = []
			for (const stat of scaling.stats) {
				if (stat === BonusKey.Health) {
					//TODO
				} else if (stat === BonusKey.Mana) {
					this.addMana(scaling.intervalAmount)
				} else {
					bonuses.push([stat, scaling.intervalAmount])
				}
			}
			this.addBonuses(scaling.source as TraitKey, ...bonuses)
		})
	}

	updateShields(elapsedMS: DOMHighResTimeStamp) {
		this.shields.forEach(shield => {
			if (shield.expiresAtMS != null && elapsedMS >= shield.expiresAtMS) {
				if (shield.repeatsEveryMS == null) {
					return
				}
				shield.activated = false
			}

			if (shield.activated !== true) {
				if (shield.activatesAtMS != null) {
					if (elapsedMS >= shield.activatesAtMS) {
						shield.activated = true
						if (shield.repeatsEveryMS != null) {
							shield.activatesAtMS += shield.repeatsEveryMS
							if (shield.expiresAtMS != null) {
								shield.expiresAtMS += shield.repeatsEveryMS
							}
						}
						if (shield.repeatAmount != null) {
							shield.amount = shield.repeatAmount
						}
					}
				} else {
					shield.activated = true
				}
			}
		})
	}

	rawCritChance() {
		return (this.data.stats.critChance ?? 0) + this.getBonuses(BonusKey.CritChance) / 100
	}
	critChance() {
		return Math.min(1, this.rawCritChance())
	}
	critMultiplier() {
		const excessCritChance = this.rawCritChance() - 1
		return this.data.stats.critMultiplier + Math.max(0, excessCritChance) + this.getBonuses(BonusKey.CritMultiplier) / 100
	}
	critReduction() {
		return this.getBonuses(BonusKey.CritReduction) / 100
	}

	updateMove(elapsedMS: DOMHighResTimeStamp) {
		const nextHex = getNextHex(this)
		if (nextHex) {
			const msPerHex = 1000 * this.moveSpeed() * HEX_PROPORTION_PER_LEAGUEUNIT
			this.moveUntilMS = elapsedMS + msPerHex
			this.activePosition = nextHex
			updatePaths(state.units)
			return true
		}
		return false
	}

	applyAttackSpeedSlow(elapsedMS: DOMHighResTimeStamp, durationMS: DOMHighResTimeStamp, amount: number) {
		const expireAt = elapsedMS + durationMS
		if (expireAt > this.attackSpeedSlow.expiresAt) {
			this.attackSpeedSlow.expiresAt = expireAt
			this.attackSpeedSlow.amount = amount
		}
	}

	opposingTeam(): TeamNumber {
		return 1 - this.team as TeamNumber
	}

	readyToCast() {
		return !!this.championEffects?.cast && this.mana >= this.manaMax()
	}
	castAbility(elapsedMS: DOMHighResTimeStamp) {
		const spell = this.getCurrentSpell()
		if (spell) {
			this.championEffects?.cast?.(elapsedMS, spell, this)
		}
		this.mana = this.getBonuses(BonusKey.ManaRestore) //TODO delay until mana lock
	}

	jumpToBackline(elapsedMS: DOMHighResTimeStamp) {
		const [col, row] = this.activePosition
		const targetHex: HexCoord = [col, this.team === 0 ? BOARD_ROW_COUNT - 1 : 0]
		this.activePosition = getClosestHexAvailableTo(targetHex, state.units) ?? this.activePosition
		this.moveUntilMS = elapsedMS + BACKLINE_JUMP_MS
		this.ghosting = false
		this.collides = true
	}

	banishUntil(ms: DOMHighResTimeStamp | null) {
		const banishing = ms != null
		this.ghosting = banishing
		this.interacts = !banishing
		this.banishUntilMS = ms ?? null
	}

	isAttackable() {
		return !this.dead && !this.ghosting
	}
	isInteractable() {
		return !this.dead && this.interacts
	}
	hasCollision() {
		return !this.dead && this.collides
	}

	isMoving(elapsedMS: DOMHighResTimeStamp) {
		return elapsedMS < this.moveUntilMS
	}

	gainHealth(amount: number) {
		//TODO grievous wounds
		this.health = Math.min(this.healthMax, this.health + amount)
	}

	setMana(amount: number) {
		this.mana = Math.min(this.manaMax(), amount)
	}
	addMana(amount: number) {
		this.setMana(this.mana + amount)
	}
	gainMana(elapsedMS: DOMHighResTimeStamp, amount: number) {
		if (elapsedMS < this.manaLockUntilMS) {
			return
		}
		this.addMana(amount)
	}

	die() {
		this.health = 0
		this.dead = true
		const teamUnits = this.alliedUnits()
		if (teamUnits.length) {
			updatePaths(state.units)
			teamUnits.forEach(unit => {
				const increaseADAP = unit.getMutantBonus(MutantType.VoraciousAppetite, MutantBonus.VoraciousADAP)
				if (increaseADAP > 0) {
					unit.addBonuses(TraitKey.Mutant, [BonusKey.AttackDamage, increaseADAP], [BonusKey.AbilityPower, increaseADAP])
				}
			})
		} else {
			gameOver(this.team)
		}
	}

	damage(elapsedMS: DOMHighResTimeStamp, originalSource: boolean, source: ChampionUnit, sourceType: DamageSourceType, damageCalculation: SpellCalculation, damageModifier: number | undefined, isAOE: boolean) {
		let [rawDamage, damageType] = solveSpellCalculationFor(this, damageCalculation)
		if (damageModifier != null) {
			rawDamage *= damageModifier
		}
		const defenseStat = damageType === DamageType.physical
			? this.armor()
			: damageType === DamageType.magic
				? this.magicResist()
				: null
		if (damageType === DamageType.physical || (damageType === DamageType.magic && (source.hasActive(TraitKey.Assassin) || source.hasItem(ItemKey.JeweledGauntlet)))) {
			const critReduction = this.critReduction()
			if (critReduction < 1) {
				const critDamage = rawDamage * source.critChance() * source.critMultiplier()
				rawDamage += critDamage * (1 - critReduction)
			}
		}
		const defenseMultiplier = defenseStat != null ? 100 / (100 + defenseStat) : 1
		let takingDamage = rawDamage * defenseMultiplier
		if (damageType !== DamageType.true) {
			const damageReduction = this.getBonuses('DamageReduction' as BonusKey) //TODO BonusKey.DamageReduction
			if (damageReduction > 0) {
				if (damageReduction >= 1) {
					console.log('ERR', 'damageReduction must be between 0–1.')
				} else {
					takingDamage *= 1 - damageReduction
				}
			}
			// if (isAOE) //TODO AOEDamageReduction
		}
		let healthDamage = takingDamage
		Array.from(this.shields)
			.filter(shield => shield.isSpellShield == null)
			.forEach(shield => {
				const protectingDamage = Math.min(shield.amount, healthDamage)
				if (protectingDamage >= shield.amount) {
					if (shield.repeatsEveryMS != null) {
						shield.amount = 0
					} else {
						shield.activated = false
					}
				} else {
					shield.amount -= protectingDamage
				}
				healthDamage -= protectingDamage
			})
		if (this.health <= healthDamage) {
			this.die()
		} else {
			this.health -= healthDamage
			const manaGain = Math.min(42.5, rawDamage * 0.01 + takingDamage * 0.07) //TODO verify https://leagueoflegends.fandom.com/wiki/Mana_(Teamfight_Tactics)#Mechanic
			this.gainMana(elapsedMS, manaGain)
		}

		// `source` effects

		const sourceVamp = source.getVamp(damageType!, sourceType)
		if (sourceVamp > 0) {
			source.gainHealth(takingDamage * sourceVamp / 100)
		}

		source.items.forEach(item => itemEffects[item.id as ItemKey]?.damageDealtByHolder?.(originalSource, this, source, sourceType, rawDamage, takingDamage, damageType!))
		this.items.forEach(item => itemEffects[item.id as ItemKey]?.damageTaken?.(item, originalSource, this, source, sourceType, rawDamage, takingDamage, damageType!))
		source.activeSynergies.forEach(([trait, style, activeEffect]) => traitEffects[trait.name as TraitKey]?.damageDealtByHolder?.(activeEffect!, elapsedMS, originalSource, this, source, sourceType, rawDamage, takingDamage, damageType!))

		if (sourceType === DamageSourceType.attack) {
			source.shields.forEach(shield => {
				if (shield.activated !== false && shield.bonusDamage) {
					this.damage(elapsedMS, false, source, DamageSourceType.trait, shield.bonusDamage, undefined, false)
				}
			})
		}
	}

	alliedUnits(): ChampionUnit[] {
		return state.units.filter(unit => unit !== this && !unit.dead && unit.team === this.team)
	}

	hexDistanceTo(unit: ChampionUnit) {
		return this.hexDistanceToHex(unit.activePosition)
	}
	hexDistanceToHex(hex: HexCoord) {
		return hexDistanceFrom(this.activePosition, hex)
	}

	isAt(position: HexCoord) {
		return isSameHex(this.activePosition, position)
	}
	isStartAt(position: HexCoord) {
		return isSameHex(this.startPosition, position)
	}
	isIn(hexes: Iterable<HexCoord>) {
		return containsHex(this.activePosition, hexes)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
		window.setTimeout(saveUnits)
	}
	coordinatePosition() {
		return coordinatePosition(this.activePosition)
	}

	getStat(key: BonusKey) {
		if (key === BonusKey.AttackDamage) {
			return this.attackDamage()
		}
		if (key === BonusKey.AbilityPower) {
			return this.abilityPower()
		}
		if (key === BonusKey.Health) {
			return this.healthMax
		}
		console.log('ERR', 'Missing stat', key)
		return 0
	}

	getCurrentSpell(): ChampionSpellData | undefined {
		return this.data.spells[this.transformIndex]
	}

	getSpellVariable(key: SpellKey) {
		return this.getCurrentSpell()?.variables[key]?.[this.starLevel]
	}
	getSpellCalculationResult(key: SpellKey) {
		const calculation = this.getSpellCalculation(key)
		return calculation ? solveSpellCalculationFor(this, calculation)[0] : 0
	}
	getSpellCalculation(key: SpellKey) {
		const spell = this.getCurrentSpell()
		if (!spell) {
			console.log('ERR', 'No spell', this.name, key)
			return undefined
		}
		const calculation = spell.calculations[key]
		if (calculation == null) {
			console.log('ERR', 'Missing calculation for', spell.name, key)
			return undefined
		}
		return calculation
	}

	getBonusesFrom(sourceKey: BonusLabelKey) {
		return this.bonuses
			.filter(bonus => bonus[0] === sourceKey)
	}
	getBonusesFromKey(sourceKey: BonusLabelKey, bonusKey: BonusKey) {
		return this.getBonusesFrom(sourceKey)
			.flatMap(bonus => bonus[1])
			.filter(bonus => bonus[0] === bonusKey)
			.reduce((acc, bonus) => acc + (bonus[1] ?? 0), 0)
	}
	getBonusVariants(bonus: BonusKey) {
		return this.getBonuses(bonus, `Bonus${bonus}` as BonusKey, `${this.starLevel}Star${bonus}` as BonusKey)
	}
	getMutantBonus(mutantType: MutantType, bonus: MutantBonus) {
		if (state.mutantType !== mutantType) {
			return 0
		}
		return this.getBonuses(`Mutant${state.mutantType}${bonus}` as BonusKey)
	}
	getBonuses(...variableNames: BonusKey[]) {
		return this.bonuses
			.reduce((accumulator, bonus: [BonusLabelKey, BonusVariable[]]) => {
				const variables = bonus[1].filter(variable => variableNames.includes(variable[0] as BonusKey))
				return accumulator + variables.reduce((total, v) => total + (v[1] ?? 0), 0)
			}, 0)
	}

	hasActive(name: BonusLabelKey) {
		return !!this.bonuses.find(bonus => bonus[0] === name)
	}
	hasItem(key: ItemKey) {
		return !!this.items.find(item => item.id === key)
	}
	hasTrait(key: TraitKey) {
		return !!this.traits.find(trait => trait.name === key)
	}
	jumpsToBackline() {
		return this.hasTrait(TraitKey.Assassin)
	}

	attackDamage() {
		const ad = this.data.stats.damage * this.starMultiplier + this.getBonusVariants(BonusKey.AttackDamage) + this.getMutantBonus(MutantType.AdrenalineRush, MutantBonus.AdrenalineAD)
		const multiplier = this.getSpellVariable(SpellKey.ADFromAttackSpeed)
		if (multiplier != null) {
			return ad + this.bonusAttackSpeed() * 100 * multiplier
		}
		return ad
	}
	abilityPower() {
		const apBonus = this.getBonusVariants(BonusKey.AbilityPower) + this.getMutantBonus(MutantType.SynapticWeb, MutantBonus.SynapticAP)
		return 100 + apBonus
	}
	manaMax() {
		const maxManaMultiplier = this.getBonuses('PercentManaReduction' as BonusKey)
		const multiplier = maxManaMultiplier === 0 ? 1 : (1 - maxManaMultiplier / 100)
		const maxManaReduction = this.getMutantBonus(MutantType.SynapticWeb, MutantBonus.SynapticManaCost)
		return (this.data.stats.mana - maxManaReduction) * multiplier
	}
	armor() {
		return this.data.stats.armor + this.getBonusVariants(BonusKey.Armor)
	}
	magicResist() {
		return this.data.stats.magicResist + this.getBonusVariants(BonusKey.MagicResist)
	}
	bonusAttackSpeed() {
		return this.getBonusVariants(BonusKey.AttackSpeed) / 100
	}
	attackSpeed() {
		return this.fixedAS ?? this.data.stats.attackSpeed + this.bonusAttackSpeed()
	}
	range() {
		return this.data.stats.range + this.getBonuses(BonusKey.HexRangeIncrease)
	}
	moveSpeed() {
		return this.data.stats.moveSpeed //TODO Featherweights, Challengers
	}

	healthProportion() {
		return this.health / this.healthMax
	}

	dodgeChance() {
		return this.getBonuses('DodgeChance' as BonusKey)
	}

	getVamp(damageType: DamageType, damageSource: DamageSourceType) {
		const vampBonuses = [BonusKey.VampOmni]
		if (damageSource !== DamageSourceType.item) {
			if (damageType === DamageType.physical) {
				vampBonuses.push(BonusKey.VampPhysical)
			}
			if (damageType === DamageType.magic || damageType === DamageType.true) {
				vampBonuses.push(BonusKey.VampSpell)
			}
		}
		return this.getBonuses(...vampBonuses)
	}

	getUnitsWithin(distance: number, team: TeamNumber | null): ChampionUnit[] {
		const hexes = getSurroundingWithin(this.activePosition, distance)
		return state.units.filter(unit => {
			if (team != null && unit.team !== team) {
				return false
			}
			return unit.isIn(hexes)
		})
	}

	queueProjectile(elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: ProjectileData) {
		if (!data.damageCalculation) {
			data.damageCalculation = this.getSpellCalculation(SpellKey.Damage)
		}
		if (!data.sourceType) {
			data.sourceType = DamageSourceType.spell
		}
		data.spell = spell
		const projectile = new Projectile(this, elapsedMS, data)
		this.pending.projectiles.add(projectile)
		this.attackStartAtMS = projectile.startsAtMS
		if (spell) {
			this.manaLockUntilMS = projectile.startsAtMS + DEFAULT_MANA_LOCK_MS
		}
	}
	queueHexEffect(elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, data: HexEffectData) {
		if (data.damageCalculation === undefined) {
			data.damageCalculation = this.getSpellCalculation(SpellKey.Damage)
		}
		const hexEffect = new HexEffect(this, elapsedMS, spell, data)
		this.pending.hexEffects.add(hexEffect)
		this.attackStartAtMS = hexEffect.startsAtMS
		this.manaLockUntilMS = hexEffect.startsAtMS + DEFAULT_MANA_LOCK_MS
	}
}
