import type { BonusKey, ChampionSpellData, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'

import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

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
export const enum DamageSourceType {
	attack, spell, item
}

export type SynergyCount = Map<TraitData, string[]>

export type SynergyData = [trait: TraitData, activeStyle: number, activeEffect: TraitEffectData | undefined, uniqueUnitNames: string[]]

export type BonusVariable = [key: string, value: number | null]
export interface BonusScaling {
	source: string
	activatedAt: DOMHighResTimeStamp
	expiresAfter?: DOMHighResTimeStamp
	stats: BonusKey[]
	intervalAmount: number
	intervalSeconds: number
}

export interface ShieldData {
	isSpellShield?: boolean
	amount: number
	expiresAtMS?: DOMHighResTimeStamp
}

type ChampionFn = (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, champion: ChampionUnit) => void
export type ChampionFns = {cast?: ChampionFn, passive?: ChampionFn}

export const enum SpellKey {
	ADFromAttackSpeed = 'ADFromAttackSpeed',
	ASBoost = 'ASBoost',
	AttackSpeed = 'AttackSpeed',
	Damage = 'Damage',
	Heal = 'Heal',
	MaxStacks = 'MaxStacks',
	StunDuration = 'StunDuration',
}

export type BonusLabelKey = TraitKey | ItemKey | SpellKey

export interface EffectResults {
	variables?: BonusVariable[]
	scalings?: BonusScaling[]
	shields?: ShieldData[]
}

export type CollisionFn = (unit: ChampionUnit) => void

export enum MutantType {
	AdrenalineRush = 'Adrenaline',
	BioLeeching = 'BioLeeching',
	Cybernetic = 'Cyber',
	Metamorphosis = 'Metamorphosis',
	SynapticWeb = 'Synaptic',
	Voidborne = 'Voidborne',
	VoraciousAppetite = 'Voracious',
}
export const enum MutantBonus {
	VoraciousADAP = 'ADAP',
	MetamorphosisArmorMR = 'ArmorMR',
	MetamorphosisGrowthRate = 'GrowthRate',
	BioLeechingOmnivamp = 'Omnivamp',
	VoidborneExecuteThreshold = 'ExecuteThreshold',
	AdrenalineAD = 'AD',
	SynapticManaCost = 'ManaCost',
	MetamorphosisADAP = 'ADAP',
	VoidborneTrueDamagePercent = 'TrueDamagePercent',
	CyberAD = 'AD',
	AdrenalineProcChance = 'ProcChance',
	SynapticAP = 'AP',
}
