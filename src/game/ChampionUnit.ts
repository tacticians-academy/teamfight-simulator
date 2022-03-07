import { markRaw } from 'vue'

import { BonusKey } from '@tacticians-academy/academy-library'
import type { ChampionData, ItemData, TraitData } from '@tacticians-academy/academy-library'

import { champions } from '@tacticians-academy/academy-library/dist/set6/champions'
import { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import { TraitKey, traits } from '@tacticians-academy/academy-library/dist/set6/traits'

import abilities from '#/data/set6/abilities'

import { getNextHex, updatePaths } from '#/game/pathfind'
import { Projectile } from '#/game/Projectile'
import type { ProjectileData } from '#/game/Projectile'
import { HexEffect } from '#/game/HexEffect'
import type { HexEffectData } from '#/game/HexEffect'
import { coordinatePosition, state } from '#/game/store'

import { containsHex, getAdjacentRowUnitsTo, getClosestHexAvailableTo, getClosesUnitOfTeamTo, getInverseHex, getNearestEnemies, hexDistanceFrom, isSameHex } from '#/helpers/boardUtils'
import { calculateItemBonuses, calculateItemScalings, calculateSynergyBonuses } from '#/helpers/bonuses'
import { BACKLINE_JUMP_MS, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT, DEFAULT_MANA_LOCK_MS, HEX_PROPORTION_PER_LEAGUEUNIT, LOCKED_STAR_LEVEL_BY_UNIT_API_NAME } from '#/helpers/constants'
import { saveUnits } from '#/helpers/storage'
import { DamageType, MutantType, MutantBonus } from '#/helpers/types'
import type { AbilityFn, BonusScaling, BonusVariable, HexCoord, StarLevel, TeamNumber, SynergyData } from '#/helpers/types'

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
	bonuses: [TraitKey | ItemKey, BonusVariable[]][] = []
	scalings = new Set<BonusScaling>()
	transformIndex = 0
	ability: AbilityFn | undefined

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
		this.ability = abilities[name]
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
		const [synergyTraitBonuses, synergyScalings] = calculateSynergyBonuses(synergiesByTeam[this.team], unitTraitKeys)
		this.bonuses = [...synergyTraitBonuses, ...calculateItemBonuses(this.items)]
		this.scalings = new Set([...synergyScalings, ...calculateItemScalings(this.items)])

		this.setMana(this.data.stats.initialMana + this.getBonuses(BonusKey.Mana))
		this.health = this.data.stats.hp * this.starMultiplier + this.getBonusVariants(BonusKey.Health)
		this.healthMax = this.health
		this.fixedAS = this.getSpellValue('AttackSpeed')

		this.pending.hexEffects.clear()
		this.pending.projectiles.clear()
	}
	postReset(units: ChampionUnit[]) {
		const banishDuration = this.getBonuses('BanishDuration' as BonusKey)
		if (banishDuration) {
			const targetHex = getInverseHex(this.startPosition)
			const target = getClosesUnitOfTeamTo(targetHex, this.opposingTeam(), units) //TODO not random
			if (target) {
				target.banishUntil(banishDuration * 1000)
			}
		}
		for (const item of this.items) {
			const hexRange = item.effects['HexRange']
			if (hexRange != null) {
				const isRowEffect = [ItemKey.BansheesClaw, ItemKey.ChaliceOfPower, ItemKey.LocketOfTheIronSolari, ItemKey.ZekesHerald].includes(item.id)
				if (isRowEffect) {
					const shield = item.effects[`${this.starLevel}StarShieldValue`]
					let bonus: BonusVariable | undefined
					if (shield != null) {
						console.log(shield) //TODO shield
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
									console.log(damageCap) //TODO spell-shield
								} else {
									console.log('ERR missing HexRange row effect', item.name, item.effects)
								}
							}
						}
					}

					const buffedUnits = getAdjacentRowUnitsTo(hexRange, this.startPosition, units)
					if (bonus !== undefined) {
						const buffBonus = bonus
						buffedUnits.forEach(unit => unit.addBonuses(item.id as ItemKey, buffBonus))
					}
				}
			}
		}
	}

	addBonuses(key: TraitKey | ItemKey, ...bonuses: BonusVariable[]) {
		this.bonuses.push([key, bonuses])
	}

	updateTarget(units: ChampionUnit[]) {
		if (this.target != null) {
			const targetDistance = this.hexDistanceTo(this.target)
			if (!this.target.isAttackable() || targetDistance > this.range()) {
				this.target = null
			} else {
				this.cachedTargetDistance = targetDistance
			}
		}
		if (this.target == null) {
			const targets = getNearestEnemies(this, units)
			if (targets.length) {
				this.target = targets[0] //TODO choose random
				this.cachedTargetDistance = this.hexDistanceTo(this.target)
				// console.log(this.name, this.team, 'targets at', this.cachedTargetDistance, 'hexes', this.target.name, this.target.team)
			}
		}
	}

	updateAttack(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		if (this.target != null) {
			const msBetweenAttacks = 1000 / this.attackSpeed()
			if (elapsedMS >= this.attackStartAtMS + msBetweenAttacks) {
				if (this.attackStartAtMS <= 0) {
					this.attackStartAtMS = elapsedMS
				} else {
					const canReProcAttack = this.attackStartAtMS > 1
					const damage = this.attackDamage()
					if (this.instantAttack) {
						this.target.damage(elapsedMS, damage, DamageType.physical, this, units, gameOver)
						this.attackStartAtMS = elapsedMS
					} else {
						this.queueProjectile(elapsedMS, {
							startsAfterMS: msBetweenAttacks / 4, //TODO from data
							missile: {
								speedInitial: this.data.basicAttackMissileSpeed ?? this.data.critAttackMissileSpeed ?? 1000, //TODO crits
							},
							target: this.target,
							damage,
							damageType: DamageType.physical,
						})
					}
					this.gainMana(elapsedMS, 10)
					if (canReProcAttack) {
						const multiAttackProcChance = this.getMutantBonus(MutantType.AdrenalineRush, MutantBonus.AdrenalineProcChance)
						if (multiAttackProcChance > 0 && Math.random() * 100 < multiAttackProcChance) { //TODO rng
							this.attackStartAtMS = 1
						}
					}
				}
			}
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

	updateMove(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const nextHex = getNextHex(this)
		if (nextHex) {
			const msPerHex = 1000 * this.moveSpeed() * HEX_PROPORTION_PER_LEAGUEUNIT
			this.moveUntilMS = elapsedMS + msPerHex
			this.activePosition = nextHex
			updatePaths(units)
			return true
		}
		return false
	}

	opposingTeam(): TeamNumber {
		return 1 - this.team as TeamNumber
	}

	readyToCast() {
		return !!this.ability && this.mana >= this.manaMax()
	}
	castAbility(elapsedMS: DOMHighResTimeStamp) {
		this.ability?.(elapsedMS, this.getCurrentSpell(), this)
		this.mana = this.getBonuses(BonusKey.ManaRestore) //TODO delay until mana lock
	}

	jumpToBackline(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const [col, row] = this.activePosition
		const targetHex: HexCoord = [col, this.team === 0 ? BOARD_ROW_COUNT - 1 : 0]
		this.activePosition = getClosestHexAvailableTo(targetHex, units) ?? this.activePosition
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
	hasCollision() {
		return !this.dead && this.collides
	}

	isMoving(elapsedMS: DOMHighResTimeStamp) {
		return elapsedMS < this.moveUntilMS
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

	die(units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		this.health = 0
		this.dead = true
		const teamUnits = units.filter(unit => !unit.dead && unit.team === this.team)
		if (teamUnits.length) {
			updatePaths(units)
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

	damage(elapsedMS: DOMHighResTimeStamp, rawDamage: number, type: DamageType, source: ChampionUnit, units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		const defenseStat = type === DamageType.physical
			? this.armor()
			: type === DamageType.magic
				? this.magicResist()
				: null
		if (type === DamageType.magic) {
			rawDamage *= source.abilityPowerMultiplier()
		}
		if (type === DamageType.physical || (type === DamageType.magic && (source.hasActive(TraitKey.Assassin) || source.hasItem(ItemKey.JeweledGauntlet)))) {
			const critReduction = this.critReduction()
			if (critReduction < 1) {
				const critDamage = rawDamage * source.critChance() * source.critMultiplier()
				rawDamage += critDamage * (1 - critReduction)
			}
		}
		const defenseMultiplier = defenseStat != null ? 100 / (100 + defenseStat) : 1
		let takingDamage = rawDamage * defenseMultiplier
		if (type !== DamageType.true) {
			const damageReduction = this.getBonuses('DamageReduction' as BonusKey) //TODO BonusKey.DamageReduction
			if (damageReduction > 0) {
				if (damageReduction >= 1) {
					console.log('ERR', 'damageReduction must be between 0–1.')
				} else {
					takingDamage *= 1 - damageReduction
				}
			}
			//TODO AOEDamageReduction
		}
		if (this.health <= takingDamage) {
			this.die(units, gameOver)
		} else {
			this.health -= takingDamage
			const manaGain = Math.min(42.5, rawDamage * 0.01 + takingDamage * 0.07) //TODO verify https://leagueoflegends.fandom.com/wiki/Mana_(Teamfight_Tactics)#Mechanic
			this.gainMana(elapsedMS, manaGain)
		}

		const sourceVamp = source.getVamp(type)
		if (sourceVamp > 0) {
			console.log('Heal', sourceVamp, takingDamage * sourceVamp / 100)
			// source.heal(takingDamage * sourceVamp / 100) //TODO
		}
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

	getCurrentSpell() {
		return this.data.spells[this.transformIndex]
	}
	getSpellValue(name: string) {
		return this.getCurrentSpell().variables[name]?.[this.starLevel]
	}

	getBonusFor(sourceKey: TraitKey | ItemKey) {
		return this.bonuses.filter(bonus => bonus[0] === sourceKey)
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
			.reduce((accumulator, bonus: [TraitKey | ItemKey, BonusVariable[]]) => {
				const variables = bonus[1].filter(variable => variableNames.includes(variable[0] as BonusKey))
				return accumulator + variables.reduce((total, v) => total + (v[1] ?? 0), 0)
			}, 0)
	}

	hasActive(name: TraitKey | ItemKey) {
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
		if (this.fixedAS != null) {
			const multiplier = this.getSpellValue('ADFromAttackSpeed')
			if (multiplier != null) {
				return ad + this.bonusAttackSpeed() * 100 * multiplier
			}
		}
		return ad
	}
	abilityPowerMultiplier() {
		const apBonus = this.getBonusVariants(BonusKey.AbilityPower) + this.getMutantBonus(MutantType.SynapticWeb, MutantBonus.SynapticAP)
		return (100 + apBonus) / 100
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

	dodgeChance() {
		return this.getBonuses('DodgeChance' as BonusKey)
	}

	getVamp(damageType: DamageType) {
		const vampBonuses = [BonusKey.VampOmni]
		if (damageType === DamageType.physical) {
			vampBonuses.push(BonusKey.VampPhysical)
		}
		if (damageType === DamageType.magic || damageType === DamageType.true) {
			vampBonuses.push(BonusKey.VampSpell)
		}
		return this.getBonuses(...vampBonuses)
	}

	queueProjectile(elapsedMS: DOMHighResTimeStamp, data: ProjectileData) {
		if (data.damage === undefined) {
			data.damage = this.getSpellValue('Damage')
		}
		if (data.damageType === undefined) {
			data.damageType = DamageType.magic
		}
		const projectile = new Projectile(this, elapsedMS, data)
		this.pending.projectiles.add(projectile)
		this.attackStartAtMS = projectile.startsAtMS
		if (data.spell) {
			this.manaLockUntilMS = projectile.startsAtMS + DEFAULT_MANA_LOCK_MS
		}
	}
	queueHexEffect(elapsedMS: DOMHighResTimeStamp, data: HexEffectData) {
		if (data.damage === undefined) {
			data.damage = this.getSpellValue('Damage')
		}
		if (data.damageType === undefined) {
			data.damageType = DamageType.magic
		}
		const hexEffect = new HexEffect(this, elapsedMS, data)
		this.pending.hexEffects.add(hexEffect)
		this.attackStartAtMS = hexEffect.startsAtMS
		this.manaLockUntilMS = hexEffect.startsAtMS + DEFAULT_MANA_LOCK_MS
	}
}
