import { markRaw } from 'vue'

import abilities from '#/data/set6/abilities'
import { champions } from '#/data/set6/champions'
import { ItemKey } from '#/data/set6/items'
import { TraitKey, traits } from '#/data/set6/traits'

import { getNextHex, updatePaths } from '#/game/pathfind'

import { containsHex, getClosestHexAvailableTo, getNearestEnemies, hexDistanceFrom, isSameHex } from '#/helpers/boardUtils'
import { calculateItemBonuses, calculateSynergyBonuses } from '#/helpers/bonuses'
import { BACKLINE_JUMP_MS, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT, HEX_MOVE_UNITS, LOCKED_STAR_LEVEL_BY_UNIT_API_NAME } from '#/helpers/constants'
import { saveUnits } from '#/helpers/storage'
import { BonusKey, DamageType } from '#/helpers/types'
import type { AbilityFn, BonusVariable, HexCoord, StarLevel, TeamNumber, ChampionData, ItemData, TraitData, SynergyData } from '#/helpers/types'
import { state } from '#/game/store'
import { Projectile } from '#/game/Projectile'

export class ChampionUnit {
	name: string
	startPosition: HexCoord = [0, 0]
	team: TeamNumber = 0
	starLevel: StarLevel
	data: ChampionData

	activePosition: HexCoord | undefined
	dead = false
	target: ChampionUnit | null = null // eslint-disable-line no-use-before-define
	mana = 0
	health = 0
	healthMax = 0
	starMultiplier = 1
	isStarLocked: boolean
	fixedAS: number | undefined = undefined
	instantAttack: boolean

	ghosting = false
	cachedTargetDistance = 0
	attackStartAtMS: DOMHighResTimeStamp = 0
	moveUntilMS: DOMHighResTimeStamp = 0
	manaLockUntilMS: DOMHighResTimeStamp = 0
	stunnedUntilMS: DOMHighResTimeStamp = 0
	items: ItemData[] = []
	traits: TraitData[] = []
	bonuses: [TraitKey | ItemKey, BonusVariable[]][] = []
	ability: AbilityFn | undefined

	constructor(name: string, position: HexCoord, starLevel: StarLevel, synergiesByTeam: SynergyData[][]) {
		const stats = champions.find(unit => unit.name === name) ?? champions[0]
		const starLockedLevel = LOCKED_STAR_LEVEL_BY_UNIT_API_NAME[stats.apiName]
		this.isStarLocked = !!starLockedLevel
		this.data = markRaw(stats)
		this.name = name
		this.starLevel = starLockedLevel ?? starLevel
		this.ability = abilities[name]
		this.instantAttack = this.data.stats.range <= 1
		this.reset(synergiesByTeam)
		this.reposition(position)
	}

	reset(synergiesByTeam: SynergyData[][]) {
		this.starMultiplier = this.starLevel === 1 ? 1 : (this.starLevel - 1) * 1.8
		this.dead = false
		this.target = null
		this.activePosition = undefined
		this.cachedTargetDistance = 0
		this.attackStartAtMS = 0
		this.moveUntilMS = 0
		this.manaLockUntilMS = 0
		this.stunnedUntilMS = 0
		this.ghosting = this.jumpsToBackline()

		const unitTraitNames = this.data.traits.concat(this.items.filter(item => item.name.endsWith(' Emblem')).map(item => item.name.replace(' Emblem', '')))
		this.traits = Array.from(new Set(unitTraitNames)).map(traitName => traits.find(trait => trait.name === traitName)).filter((trait): trait is TraitData => !!trait)
		this.bonuses = [...calculateSynergyBonuses(synergiesByTeam[this.team], unitTraitNames), ...calculateItemBonuses(this.items)]

		this.mana = this.data.stats.initialMana + this.getBonuses(BonusKey.Mana)
		this.health = this.data.stats.hp * this.starMultiplier + this.getBonusVariants(BonusKey.Health)
		this.healthMax = this.health
		this.fixedAS = this.data.ability.variables.find(v => v.name === 'AttackSpeed')?.value?.[this.starLevel]
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
				if (this.attackStartAtMS > 0) {
					const damage = this.attackDamage()
					if (this.instantAttack) {
						this.target.damage(elapsedMS, damage, DamageType.physical, this, units, gameOver)
					} else {
						new Projectile(100, 0, this, this.target, damage, DamageType.physical)
					}
					this.gainMana(elapsedMS, 10)
				}
				this.attackStartAtMS = elapsedMS
			}
		}
	}

	critChance() {
		return (this.data.stats.critChance ?? 0) + this.getBonuses(BonusKey.CritChance) / 100
	}
	critMultiplier() {
		const excessCritChance = this.critChance() - 1
		return this.data.stats.critMultiplier + Math.max(0, excessCritChance) + this.getBonuses(BonusKey.CritMultiplier) / 100
	}
	critReduction() {
		return this.getBonuses(BonusKey.CritReduction) / 100
	}

	updateMove(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const nextHex = getNextHex(this)
		if (nextHex) {
			const msPerHex = 1000 * HEX_MOVE_UNITS / this.moveSpeed()
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
		this.ability?.(elapsedMS, this)
		this.mana = 0
	}

	jumpToBackline(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const [col, row] = this.currentPosition()
		const targetHex: HexCoord = [col, this.team === 0 ? BOARD_ROW_COUNT - 1 : 0]
		this.activePosition = getClosestHexAvailableTo(targetHex, units) ?? this.currentPosition()
		this.moveUntilMS = elapsedMS + BACKLINE_JUMP_MS
		this.ghosting = false
	}

	isAttackable() {
		return !this.dead && !this.ghosting
	}
	hasCollision() {
		return !this.dead && !this.ghosting
	}

	isMoving(elapsedMS: DOMHighResTimeStamp) {
		return elapsedMS < this.moveUntilMS
	}

	gainMana(elapsedMS: DOMHighResTimeStamp, amount: number) {
		if (elapsedMS < this.manaLockUntilMS) {
			return
		}
		this.mana = Math.min(this.manaMax(), this.mana + amount)
	}

	die(units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		this.health = 0
		this.dead = true
		if (units.find(unit => unit.team === this.team && !unit.dead)) {
			updatePaths(units)
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
		const takingDamage = rawDamage * defenseMultiplier
		if (this.health <= takingDamage) {
			this.die(units, gameOver)
		} else {
			this.health -= takingDamage
			const manaGain = Math.min(42.5, rawDamage * 0.01 + takingDamage * 0.07) //TODO verify https://leagueoflegends.fandom.com/wiki/Mana_(Teamfight_Tactics)#Mechanic
			this.gainMana(elapsedMS, manaGain)
		}
	}

	hexDistanceTo(unit: ChampionUnit) {
		return hexDistanceFrom(this.currentPosition(), unit.currentPosition())
	}

	isAt(position: HexCoord) {
		return isSameHex(this.currentPosition(), position)
	}
	isStartAt(position: HexCoord) {
		return isSameHex(this.startPosition, position)
	}
	isIn(hexes: Iterable<HexCoord>) {
		return containsHex(this.currentPosition(), hexes)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
		window.setTimeout(saveUnits)
	}
	currentPosition() {
		return this.activePosition ?? this.startPosition
	}
	coordinatePosition() {
		const [col, row] = this.currentPosition()
		return state.hexRowsCols[row][col].position
	}

	getAbilityValue(name: string) {
		const entry = this.data.ability.variables.find(valueObject => valueObject.name === name)
		return entry?.value?.[this.starLevel]
	}
	getBonusFor(sourceKey: TraitKey | ItemKey) {
		return this.bonuses.filter(bonus => bonus[0] === sourceKey)
	}
	getBonusVariants(bonus: BonusKey) {
		return this.getBonuses(bonus, `Bonus${bonus}` as BonusKey, `${this.starLevel}Star${bonus}` as BonusKey)
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
		const ad = this.data.stats.damage * this.starMultiplier + this.getBonusVariants(BonusKey.AttackDamage)
		if (this.fixedAS != null) {
			const multiplier = this.data.ability.variables.find(v => v.name === 'ADFromAttackSpeed')?.value?.[this.starLevel]
			if (multiplier != null) {
				return ad + this.bonusAttackSpeed() * 100 * multiplier
			}
		}
		return ad
	}
	abilityPowerMultiplier() {
		return (100 + this.getBonusVariants(BonusKey.AbilityPower)) / 100
	}
	manaMax() {
		return this.data.stats.mana //TODO yordle mutant
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
		return 550 //TODO featherweights
	}
}
