import { containsHex, getNearestEnemies, isSameHex } from '#/game/boardUtils'
import { BOARD_ROW_PER_SIDE_COUNT } from '#/game/constants'
import type { HexCoord, StarLevel, UnitStats } from '#/game/types'
import { DamageType } from '#/game/types'

import { sniper } from '#/game/data/set6/traits'
import { allUnits } from '#/game/data/set6/units'

export class UnitData {
	name: string
	startPosition: HexCoord = [0, 0]
	team: 0 | 1 = 0
	starLevel: StarLevel = 1
	stats: UnitStats

	activePosition: HexCoord | undefined
	dead = false
	target: UnitData | null = null // eslint-disable-line no-use-before-define
	mana = 0
	health = 0
	healthMax = 0
	attackSpeedMultiplier = 1
	starMultiplier = 1

	cachedTargetDistance = 0
	attackStartAt = 0

	constructor(name: string, position: HexCoord) {
		const stats = allUnits.find(unit => unit.name === name)
		if (!stats) {
			console.log('ERR Invalid unit', name)
		}
		this.stats = stats ?? allUnits[0]
		this.name = name
		this.reset()
		this.reposition(position)
	}

	reset() {
		this.starMultiplier = this.starLevel === 1 ? 1 : (this.starLevel - 1) * 1.8
		this.dead = false
		this.target = null
		this.activePosition = undefined
		this.mana = this.stats.ability.manaStart
		this.health = this.stats.health * this.starMultiplier
		this.healthMax = this.health
		this.attackSpeedMultiplier = 1
	}

	updateTarget(units: UnitData[]) {
		if (this.target != null) {
			const targetDistance = this.hexDistanceTo(this.target)
			if (this.target.dead || targetDistance > this.range()) {
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

	updateAttack(frameTiming: DOMHighResTimeStamp) {
		if (this.target != null) {
			const msBetweenAttacks = 1000 / this.attackSpeed()
			if (frameTiming >= this.attackStartAt + msBetweenAttacks) {
				if (this.attackStartAt > 0) {
					this.target.damage(this.attackDamage(), DamageType.physical) //TODO projectile
					this.gainMana(10)
				}
				this.attackStartAt = frameTiming
			}
		}
	}

	gainMana(amount: number) {
		this.mana = Math.min(this.manaMax(), this.mana + amount)
	}

	damage(rawDamage: number, type: DamageType) {
		const defenseStat = type === DamageType.physical
			? this.armor()
			: type === DamageType.magic
				? this.magicResist()
				: null
		const defenseMultiplier = defenseStat != null ? 100 / (100 + defenseStat) : 1
		const takenDamage = rawDamage * defenseMultiplier
		if (this.health < takenDamage) {
			this.health = 0
			this.dead = true
		} else {
			this.health -= takenDamage
			const manaGain = Math.min(42.5, rawDamage * 0.01 + takenDamage * 0.07) //TODO verify https://leagueoflegends.fandom.com/wiki/Mana_(Teamfight_Tactics)#Mechanic
			this.gainMana(manaGain)
		}
	}

	hexDistanceTo(unit: UnitData) {
		const [ destCol, destRow ] = unit.currentPosition()
		const [ sourceCol, sourceRow ] = this.currentPosition()
		let currentCol = sourceCol, currentRow = sourceRow
		let distanceAccumulator = 0
		while (currentCol !== destCol && currentRow !== destRow) {
			const isInsetRow = currentRow % 2 === 1
			if (currentRow === destRow) {
				currentCol += currentCol > destCol ? -1 : 1
			} else {
				currentRow += currentRow > destRow ? -1 : 1
				if (currentCol > destCol) {
					if (!isInsetRow) {
						currentCol += -1
					}
				} else {
					if (isInsetRow) {
						currentCol += 1
					}
				}
			}
			distanceAccumulator += 1
		}
		return distanceAccumulator
	}

	isAt(position: HexCoord) {
		return isSameHex(this.currentPosition(), position)
	}
	isStartAt(position: HexCoord) {
		return isSameHex(this.startPosition, position)
	}
	isIn(hexes: HexCoord[]) {
		return containsHex(this.currentPosition(), hexes)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
	}
	currentPosition() {
		return this.activePosition ?? this.startPosition
	}

	attackDamage() {
		return this.stats.attack * this.starMultiplier //TODO items
	}
	manaMax() {
		return this.stats.ability.manaMax //TODO yordle mutant
	}
	armor() {
		return this.stats.armor //TODO items
	}
	magicResist() {
		return this.stats.magicResist //TODO items
	}
	attackSpeed() {
		return this.stats.attackSpeed * this.attackSpeedMultiplier //TODO items
	}
	range() {
		return this.stats.range + (this.stats.traits.includes(sniper) ? 1 : 0) //TODO items
	}
}
