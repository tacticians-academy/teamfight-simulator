import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { AugmentData, ChampionSpellData, ChampionSpellMissileData, EffectVariables, TraitKey } from '@tacticians-academy/academy-library'

import { ChampionUnit } from '#/game/ChampionUnit'
import type { AttackBounce } from '#/game/effects/GameEffect'
import { getCoordFrom, state } from '#/game/store'

import { coordinateDistanceSquared, getClosestHexAvailableTo, getDistanceUnitOfTeamWithinRangeTo, getSurroundingWithin } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { BOARD_COL_COUNT } from '#/helpers/constants'
import { StatusEffectType } from '#/helpers/types'
import type { DamageModifier, HexCoord, StarLevel, TeamNumber } from '#/helpers/types'
import { getArrayValueCounts, randomItem } from '#/helpers/utils'

export function getBestSortedAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	const results: [number, T][] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		results.push([value, entry])
	})
	return results
		.sort((a, b) => (b[0] - a[0]) * (isMaximum ? 1 : -1))
		.map(data => data[1])
}

export function getBestUniqueAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | undefined {
	let bestValue: number | null
	let bestResult: T | undefined
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		if (bestValue == null || (isMaximum ? value > bestValue : value < bestValue)) {
			bestValue = value
			bestResult = entry
		}
	})
	return bestResult
}

export function getBestArrayAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	let bestValue: number | null
	let bestResults: T[] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		if (bestValue == null || (isMaximum ? value > bestValue : value < bestValue)) {
			bestValue = value
			bestResults = [entry]
		} else if (value === bestValue) {
			bestResults.push(entry)
		}
	})
	return bestResults
}

export function getBestRandomAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | undefined {
	return randomItem(getBestArrayAsMax(isMaximum, entries, valueFn)) ?? undefined
}

export function getBestHexWithinRangeTo(target: ChampionUnit, maxHexRange: number, possibleHexes: HexCoord[]): HexCoord | undefined {
	return getBestRandomAsMax(true, possibleHexes, (hex) => {
		const outOfRange = target.hexDistanceTo(hex) > maxHexRange
		return coordinateDistanceSquared(target.coord, getCoordFrom(hex)) * (outOfRange ? -1 : 1)
	})
}

export function spawnUnit(fromUnit: ChampionUnit, name: string, starLevel: StarLevel) {
	const hex = fromUnit.activeHex
	const spawn = new ChampionUnit(name, getClosestHexAvailableTo(hex, state.units) ?? hex, starLevel)
	spawn.wasSpawnedDuringFight = true
	spawn.genericReset()
	spawn.team = fromUnit.team
	state.units.push(spawn)
	return spawn
}

type ItemAugmentCompatible = {name?: string, effects?: EffectVariables, variables?: EffectVariables}

export function getVariables({name, effects, variables}: ItemAugmentCompatible, ...keys: string[]) {
	if (effects === undefined) {
		effects = variables
	}
	return keys.map(key => {
		const value = effects![key]
		if (value === undefined && key !== 'SyndicateIncrease') { console.log('ERR', name ?? 'augment', key, effects) }
		return value ?? 0
	})
}

export const GRIEVOUS_BURN_ID = 'BURN'

export function applyGrievousBurn(itemAugment: ItemAugmentCompatible, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit | undefined, ticksPerSecond: number) {
	if (ticksPerSecond <= 0) { ticksPerSecond = 1 }
	const variables = itemAugment.variables ?? itemAugment.effects!
	const [grievousWounds] = getVariables(itemAugment, 'GrievousWoundsPercent')
	const durationSeconds = variables['BurnDuration'] ?? variables['Duration']!
	const totalBurn = variables['BurnPercent'] ?? variables['TotalBurnPercent']!
	target.applyStatusEffect(elapsedMS, StatusEffectType.grievousWounds, durationSeconds * 1000, grievousWounds / 100)

	const existing = Array.from(target.bleeds).find(bleed => bleed.sourceID === GRIEVOUS_BURN_ID)
	const repeatsEverySeconds = 1 / ticksPerSecond
	const repeatsEveryMS = repeatsEverySeconds * 1000
	const tickCount = durationSeconds / repeatsEverySeconds
	const damage = totalBurn / tickCount / 100
	const damageCalculation = createDamageCalculation(GRIEVOUS_BURN_ID, damage, DamageType.true, BonusKey.Health, true, 1, false)
	if (existing) {
		existing.remainingIterations = tickCount
		existing.damageCalculation = damageCalculation
		existing.source = source
		existing.repeatsEveryMS = repeatsEveryMS
	} else {
		target.bleeds.add({
			sourceID: GRIEVOUS_BURN_ID,
			source,
			damageCalculation,
			activatesAtMS: elapsedMS + repeatsEveryMS,
			repeatsEveryMS,
			remainingIterations: tickCount,
		})
	}
}

export const activatedCheck: Record<string, number | undefined> = {}
export const thresholdCheck: Record<string, number | undefined> = {}

export function resetChecks() {
	Object.keys(activatedCheck).forEach(key => delete activatedCheck[key])
	Object.keys(thresholdCheck).forEach(key => delete thresholdCheck[key])
}

export function checkCooldown(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, cooldownSeconds: number, cooldownID: string, appliesOnFirstInstance: boolean) {
	if (cooldownSeconds <= 0) {
		return true
	}
	const checkKey = unit.instanceID + cooldownID
	const activatedAtMS = activatedCheck[checkKey]
	if (activatedAtMS != null && elapsedMS < activatedAtMS + cooldownSeconds * 1000) {
		return false
	}
	activatedCheck[checkKey] = elapsedMS
	return appliesOnFirstInstance || activatedAtMS != null
}
export function checkCooldownFor(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, entity: ItemAugmentCompatible, cooldownID: string, appliesOnFirstInstance: boolean, cooldownKey: string = 'ICD') {
	const [cooldownSeconds] = getVariables(entity, cooldownKey)
	return checkCooldown(elapsedMS, unit, cooldownSeconds, cooldownID, appliesOnFirstInstance)
}

export function getUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team))
}

export function getAliveUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => !unit.dead && (team == null || unit.team === team))
}
export function getAliveUnitsOfTeamWithTrait(team: TeamNumber | null, trait: TraitKey) {
	return getAliveUnitsOfTeam(team).filter(unit => unit.hasTrait(trait))
}
export function getAttackableUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team) && unit.isAttackable())
}
export function getInteractableUnitsOfTeam(team: TeamNumber | null) {
	return state.units.filter(unit => (team == null || unit.team === team) && unit.isInteractable())
}

export function getRowOfMostAttackable(team: TeamNumber | null) {
	const units = getAttackableUnitsOfTeam(team)
	const unitRows = units.map(unit => unit.activeHex[1])
	const unitsPerRow = getArrayValueCounts(unitRows)
	const maxUnitsInRowCount = unitsPerRow.reduce((previous, current) => Math.max(previous, current[1]), 0)
	const randomRowTarget = randomItem(unitsPerRow.filter(row => row[1] === maxUnitsInRowCount))
	const row = randomRowTarget ? parseInt(randomRowTarget[0], 10) : 0
	return [...Array(BOARD_COL_COUNT).keys()].map((col): HexCoord => [col, row])
}

export function getDistanceHex(isMaximum: boolean, fromUnit: ChampionUnit, hexes: HexCoord[]) {
	return getBestRandomAsMax(isMaximum, hexes, (hex) => fromUnit.coordDistanceSquaredTo(hex))
}

export function getDistanceUnit(isMaximum: boolean, fromUnit: ChampionUnit, team?: TeamNumber | null) {
	const units = getInteractableUnitsOfTeam(team === undefined ? fromUnit.opposingTeam() : team)
		.filter(unit => unit !== fromUnit)
	return getBestUniqueAsMax(isMaximum, units, (unit) => fromUnit.coordDistanceSquaredTo(unit))
}
export function getDistanceUnitFromUnits(isMaximum: boolean, fromUnit: ChampionUnit, units: ChampionUnit[]) {
	return getBestUniqueAsMax(isMaximum, units, (unit) => fromUnit.coordDistanceSquaredTo(unit))
}

export function modifyMissile(spell: ChampionSpellData, data: ChampionSpellMissileData) {
	const missile: ChampionSpellMissileData = {...spell.missile}
	Object.keys(data).forEach(stringKey => {
		const key = stringKey as keyof ChampionSpellMissileData
		if (missile[key] == null) {
			missile[key] = data[key] as any
		}
	})
	return missile
}

export function getProjectileSpread(count: number, radiansBetween: number) {
	const results: number[] = []
	const offsetRadians = count % 2 === 0 ? radiansBetween / 2 : 0
	for (let castIndex = 0; castIndex < count; castIndex += 1) {
		results[castIndex] = offsetRadians + radiansBetween * Math.ceil(castIndex / 2) * (castIndex % 2 === 0 ? 1 : -1)
	}
	return results
}

export function spawnClones(cloneCount: number, augment: AugmentData, units: ChampionUnit[], valueFn: (unit: ChampionUnit) => number) {
	const bestUnit = getBestUniqueAsMax(true, units, valueFn)
	if (bestUnit) {
		const [cloneHealth] = getVariables(augment, 'CloneHealth')
		for (let index = 0; index < cloneCount; index += 1) {
			const clone = spawnUnit(bestUnit, bestUnit.name, bestUnit.starLevel)
			clone.health = cloneHealth
			clone.healthMax = cloneHealth
			clone.traits = [] //TODO verify what bonuses apply to clones
			clone.activeSynergies = []
			clone.bonuses = []
			clone.scalings.clear()
			clone.shields = []
			clone.pendingBonuses.clear()
		}
	}
}

// Bounces

export function getChainFrom(unit: ChampionUnit, bounces: number, maxDistance?: number) {
	const chainUnits: ChampionUnit[] = []
	let currentBounceTarget: ChampionUnit | undefined = unit
	while (currentBounceTarget && chainUnits.length < bounces) {
		chainUnits.push(currentBounceTarget)
		const unchainedUnits = state.units.filter(unit => !chainUnits.includes(unit))
		currentBounceTarget = getDistanceUnitOfTeamWithinRangeTo(false, currentBounceTarget, unit.team, maxDistance, unchainedUnits)
	}
	return chainUnits
}

export function getNextBounceFrom(fromUnit: ChampionUnit, bounce: AttackBounce) {
	if (bounce.bouncesRemaining <= 0) {
		return undefined
	}
	const originalTarget = bounce.hitUnits![0]
	const target = getBestRandomAsMax(false, getInteractableUnitsOfTeam(fromUnit.team), (allyUnit) => {
		if (bounce.hitUnits!.includes(allyUnit)) { return undefined }
		if (bounce.maxHexRangeFromOriginalTarget != null && allyUnit.hexDistanceTo(originalTarget) > bounce.maxHexRangeFromOriginalTarget) {
			return undefined
		}
		return allyUnit.coordDistanceSquaredTo(fromUnit)
	})
	if (target) {
		bounce.hitUnits?.push(target)
	}
	return target
}

export function applyStackingModifier(targetModifier: DamageModifier, stackingModifier: DamageModifier) {
	// Object.keys(stackingModifier).forEach(keyString => {
	// 	const key = keyString as keyof DamageModifier
	// 	const value = stackingModifier[key]
	// 	if (value != null) {
	// 		targetModifier[key] = (targetModifier[key] ?? 0) + value
	// 	}
	// })
	// if (targetModifier.multiplier != null) {
	// 	targetModifier.multiplier = Math.max(-1, Math.min(1, targetModifier.multiplier))
	// }
	if (stackingModifier.critChance != null) {
		targetModifier.critChance = (targetModifier.critChance ?? 0) + stackingModifier.critChance
	}
	if (stackingModifier.increase != null) {
		targetModifier.increase = (targetModifier.increase ?? 0) + stackingModifier.increase
	}
	if (stackingModifier.multiplier != null) {
		if (targetModifier.multiplier == null) {
			targetModifier.multiplier = stackingModifier.multiplier
		} else {
			targetModifier.multiplier += targetModifier.multiplier * Math.abs(stackingModifier.multiplier) //TODO experimentally determine multiplicative stacking
		}
	}
}
