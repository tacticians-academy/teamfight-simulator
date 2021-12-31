import { containsHex, getClosestHexAvailableTo, getNearestEnemies, isSameHex } from '#/game/boardUtils'
import { BACKLINE_JUMP_MS, BOARD_ROW_COUNT, BOARD_ROW_PER_SIDE_COUNT, HEX_MOVE_UNITS } from '#/game/constants'
import type { HexCoord, StarLevel, TeamNumber, UnitStats } from '#/game/types'
import { DamageType } from '#/game/types'

import { assassin, sniper } from '#/game/data/set6/traits'
import { allUnits } from '#/game/data/set6/units'
import { getNextHex, updatePaths } from '#/game/pathfinding'

export class UnitData {
	name: string
	startPosition: HexCoord = [0, 0]
	team: TeamNumber = 0
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

	ghosting = false
	cachedTargetDistance = 0
	attackStartAt = 0
	moveUntil: DOMHighResTimeStamp = 0

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
		this.cachedTargetDistance = 0
		this.attackStartAt = 0
		this.moveUntil = 0
		this.ghosting = this.jumpsToBackline()
	}

	updateTarget(units: UnitData[]) {
		if (this.target != null) {
			const targetDistance = this.hexDistanceTo(this.target)
			if (!this.target.attackable() || targetDistance > this.range()) {
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

	updateAttack(frameTiming: DOMHighResTimeStamp, units: UnitData[], gameOver: (team: TeamNumber) => void) {
		if (this.target != null) {
			const msBetweenAttacks = 1000 / this.attackSpeed()
			if (frameTiming >= this.attackStartAt + msBetweenAttacks) {
				if (this.attackStartAt > 0) {
					this.target.damage(this.attackDamage(), DamageType.physical, units, gameOver) //TODO projectile
					this.gainMana(10)
				}
				this.attackStartAt = frameTiming
			}
		}
	}

	updateMove(frameMS: DOMHighResTimeStamp, units: UnitData[]) {
		const nextHex = getNextHex(this)
		if (nextHex) {
			const msPerHex = 1000 * HEX_MOVE_UNITS / this.moveSpeed()
			this.moveUntil = frameMS + msPerHex
			this.activePosition = nextHex
			updatePaths(units)
			return true
		}
		return false
	}

	jumpToBackline(frameMS: DOMHighResTimeStamp, units: UnitData[]) {
		const [col, row] = this.currentPosition()
		const targetHex: HexCoord = [col, this.team === 0 ? BOARD_ROW_COUNT - 1 : 0]
		this.activePosition = getClosestHexAvailableTo(targetHex, units) ?? this.currentPosition()
		this.moveUntil = frameMS + BACKLINE_JUMP_MS
		this.ghosting = false
	}

	attackable() {
		return !this.dead && !this.ghosting
	}
	collides() {
		return !this.dead && !this.ghosting
	}

	isMoving(frameMS: DOMHighResTimeStamp) {
		return frameMS < this.moveUntil
	}

	gainMana(amount: number) {
		this.mana = Math.min(this.manaMax(), this.mana + amount)
	}

	damage(rawDamage: number, type: DamageType, units: UnitData[], gameOver: (team: TeamNumber) => void) {
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
			if (units.find(unit => unit.team === this.team && !unit.dead)) {
				updatePaths(units)
			} else {
				gameOver(this.team)
			}
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
	isIn(hexes: Iterable<HexCoord>) {
		return containsHex(this.currentPosition(), hexes)
	}

	reposition(position: HexCoord) {
		this.startPosition = position
		this.team = position[1] < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1
	}
	currentPosition() {
		return this.activePosition ?? this.startPosition
	}

	jumpsToBackline() {
		return this.stats.traits.includes(assassin) //TODO assassin spat
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
		return this.stats.range + (this.stats.traits.includes(sniper) ? 1 : 0) //TODO rfc, sniper spat
	}
	moveSpeed() {
		return 550 //TODO featherweights
	}
}
