import type { BonusKey, ChampionSpellData, SpellCalculation, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'

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
	hex: HexCoord
	starLevel: StarLevel
	items: ItemKey[]
}

export type UnitLevelStats = [number, number?, number?]

export const enum DamageSourceType {
	attack, spell, item, trait
}

export type SynergyCount = Map<TraitData, string[]>

export type SynergyData = [trait: TraitData, activeStyle: number, activeEffect: TraitEffectData | undefined, uniqueUnitNames: string[]]

export type BonusVariable = [key: string, value: number | null, expiresAtMS?: DOMHighResTimeStamp]

export interface BonusScaling {
	source: string
	activatedAt: DOMHighResTimeStamp
	expiresAfter?: DOMHighResTimeStamp
	stats: BonusKey[]
	intervalAmount: number
	intervalSeconds: number
}

export interface BleedData {
	sourceID: string
	source: ChampionUnit
	damageCalculation: SpellCalculation
	activatesAtMS: DOMHighResTimeStamp
	repeatsEveryMS: DOMHighResTimeStamp
	remainingIterations: number
}

export interface ShieldData {
	activated?: boolean
	activatesAtMS?: DOMHighResTimeStamp
	isSpellShield?: boolean
	amount: number
	repeatAmount?: number
	expiresAtMS?: DOMHighResTimeStamp
	repeatsEveryMS?: DOMHighResTimeStamp
	bonusDamage?: SpellCalculation
}

export type ChampionFns = {
	cast?: (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, champion: ChampionUnit) => void,
	passive?: (elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit) => void,
}

export const enum SpellKey {
	ADFromAttackSpeed = 'ADFromAttackSpeed',
	ASBoost = 'ASBoost',
	AttackSpeed = 'AttackSpeed',
	Damage = 'Damage',
	Heal = 'Heal',
	HealAmount = 'HealAmount',
	Mana = 'Mana',
	MaxStacks = 'MaxStacks',
	PercentHealth = 'PercentHealth',
	StunDuration = 'StunDuration',
}

export type BonusLabelKey = TraitKey | ItemKey | SpellKey

export interface EffectResults {
	variables?: BonusVariable[]
	scalings?: BonusScaling[]
	shields?: ShieldData[]
}

export enum StatusEffectType {
	aoeDamageReduction = 'aoeDamageReduction',
	armorReduction = 'armorReduction',
	attackSpeedSlow = 'attackSpeedSlow',
	grievousWounds = 'grievousWounds',
	magicResistReduction = 'magicResistReduction',
	stealth = 'stealth',
}

export interface StatusEffectData {
	durationMS: number
	amount: number
}
export type StatusEffectsData = {[key in StatusEffectType]?: StatusEffectData}

export interface StatusEffect {
	active: boolean
	expiresAt: number
	amount: number
}
export type StatusEffects = Record<StatusEffectType, StatusEffect>

export type CollisionFn = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void

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
