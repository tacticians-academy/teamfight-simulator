import { BonusKey, DamageType } from '@tacticians-academy/academy-library'
import type { ChampionSpellData, ChampionSpellMissileData, EffectVariables } from '@tacticians-academy/academy-library'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import { ChampionUnit } from '#/game/ChampionUnit'
import type { AttackBounce } from '#/game/effects/GameEffect'
import { state } from '#/game/store'

import { getClosestHexAvailableTo, getDistanceUnitOfTeamWithinRangeTo } from '#/helpers/boardUtils'
import { createDamageCalculation } from '#/helpers/calculate'
import { BOARD_COL_COUNT } from '#/helpers/constants'
import { StatusEffectType } from '#/helpers/types'
import type { HexCoord, StarLevel, TeamNumber } from '#/helpers/types'
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

export function getBestAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | undefined {
	let bestValue = isMaximum ? 0 : Number.MAX_SAFE_INTEGER
	let bestResult: T | undefined
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		if (isMaximum ? value > bestValue : value < bestValue) {
			bestValue = value
			bestResult = entry
		}
	})
	return bestResult
}

export function getBestArrayAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T[] {
	let bestValue = isMaximum ? 0 : Number.MAX_SAFE_INTEGER
	let bestResults: T[] = []
	entries.forEach(entry => {
		const value = valueFn(entry)
		if (value == null) { return }
		if (isMaximum ? value > bestValue : value < bestValue) {
			bestValue = value
			bestResults = [entry]
		} else if (value === bestValue) {
			bestResults.push(entry)
		}
	})
	return bestResults
}

export function getBestRandomAsMax<T>(isMaximum: boolean, entries: T[], valueFn: (entry: T) => number | undefined): T | null {
	return randomItem(getBestArrayAsMax(isMaximum, entries, valueFn))
}

export function spawnUnit(fromUnit: ChampionUnit, name: string, starLevel: StarLevel) {
	const hex = fromUnit.activeHex
	const spawn = new ChampionUnit(name, getClosestHexAvailableTo(hex, state.units) ?? hex, starLevel)
	spawn.wasSpawned = true
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
		if (value === undefined) { console.log('ERR', name, key, effects) }
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

export function checkCooldown(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, entity: ItemAugmentCompatible, cooldownID: string, instantlyApplies: boolean, cooldownKey: string = 'ICD') {
	const checkKey = unit.instanceID + cooldownID
	const activatedAtMS = activatedCheck[checkKey]
	const [cooldownSeconds] = getVariables(entity, cooldownKey)
	if (cooldownSeconds <= 0) {
		return true
	}
	if (activatedAtMS != null && elapsedMS < activatedAtMS + cooldownSeconds * 1000) {
		return false
	}
	activatedCheck[checkKey] = elapsedMS
	return instantlyApplies ? true : activatedAtMS != null
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
	return getBestAsMax(isMaximum, hexes, (hex) => fromUnit.coordDistanceSquaredTo(hex))
}

export function getDistanceUnit(isMaximum: boolean, fromUnit: ChampionUnit, team?: TeamNumber | null) {
	const units = getInteractableUnitsOfTeam(team === undefined ? fromUnit.opposingTeam() : team)
		.filter(unit => unit !== fromUnit)
	return getBestAsMax(isMaximum, units, (unit) => fromUnit.coordDistanceSquaredTo(unit))
}
export function getDistanceUnitFromUnits(isMaximum: boolean, fromUnit: ChampionUnit, units: ChampionUnit[]) {
	return getBestAsMax(isMaximum, units, (unit) => fromUnit.coordDistanceSquaredTo(unit))
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

// Bounces

export function getChainFrom(unit: ChampionUnit, bounces: number, maxDistance?: number) {
	const chainUnits: ChampionUnit[] = []
	let currentBounceTarget: ChampionUnit | null = unit
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
