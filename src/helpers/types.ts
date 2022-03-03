import type { BonusKey, ChampionSpellData, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'

import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'

import type { ChampionUnit } from '#/game/ChampionUnit'

export type HexCoord = [col: number, row: number]

export type StarLevel = 1 | 2 | 3 | 4
export type TeamNumber = 0 | 1

export interface HexRowCol {
	position: HexCoord
}

export interface StorageChampion {
	name: string
	position: HexCoord
	starLevel: StarLevel
	items: ItemKey[]
}

export type UnitLevelStats = [number, number?, number?]

export const enum DamageType {
	physical, magic, true
}

export type SynergyCount = Map<TraitData, string[]>

export type SynergyData = [trait: TraitData, activeStyle: number, activeEffect: TraitEffectData | undefined, uniqueUnitNames: string[]]

export type BonusVariable = [key: string, value: number | null]
export interface BonusRegen {
	activatedAt: DOMHighResTimeStamp
	expiresAfter?: DOMHighResTimeStamp
	stat: BonusKey.Mana | BonusKey.Health
	perTick: number
	tickRate: number
}

export type AbilityFn = (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, champion: ChampionUnit) => void
export type TraitEffectResults = [BonusVariable[], BonusRegen[]]
export type TraitEffectFn = (activeEffect: TraitEffectData) => TraitEffectResults
