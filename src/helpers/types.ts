import type { BonusKey, SpellCalculation, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'
import type { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'
import type { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'
import type { ItemKey } from '@tacticians-academy/academy-library/dist/set6/items'
import type { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

import type { ChampionUnit } from '#/game/ChampionUnit'

export type HexCoord = [col: number, row: number]

export type StarLevel = 1 | 2 | 3 | 4
export type TeamNumber = 0 | 1

export interface HexRowCol {
	coord: HexCoord
}

export interface StorageChampion {
	name: string
	hex: HexCoord
	starLevel: StarLevel
	items: ItemKey[]
}

export type UnitLevelStats = [number, number?, number?]

export const enum DamageSourceType {
	attack, spell, item, trait, bonus
}

export interface SynergyData {
	key: TraitKey
	trait: TraitData
	activeStyle: number
	activeEffect: TraitEffectData | undefined
	uniqueUnitNames: string[]
}

export enum StatusEffectType {
	aoeDamageReduction = 'aoeDamageReduction',
	armorReduction = 'armorReduction',
	attackSpeedSlow = 'attackSpeedSlow',
	banished = 'banished',
	grievousWounds = 'grievousWounds',
	invulnerable = 'invulnerable',
	magicResistReduction = 'magicResistReduction',
	stealth = 'stealth',
	stunned = 'stunned',
}

export type StatusEffectData = [StatusEffectType, {
	durationMS: number
	amount?: number
}]

export interface StatusEffect {
	active: boolean
	expiresAtMS: number
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

export const enum SpellKey {
	ADFromAttackSpeed = 'ADFromAttackSpeed',
	ASBoost = 'ASBoost',
	AttackSpeed = 'AttackSpeed',
	Damage = 'Damage',
	DamageReduction = 'DamageReduction',
	Duration = 'Duration',
	Heal = 'Heal',
	HealAmount = 'HealAmount',
	ManaReave = 'ManaReave',
	MaxStacks = 'MaxStacks',
	PercentHealth = 'PercentHealth',
	StunDuration = 'StunDuration',
}

export type BonusLabelKey = AugmentGroupKey | ChampionKey | TraitKey | ItemKey | SpellKey | MutantType

export type BonusVariable = [key: string, value: number | null, expiresAtMS?: DOMHighResTimeStamp]

export interface BonusScaling {
	source: ChampionUnit | undefined
	sourceID: BonusLabelKey
	activatedAtMS: DOMHighResTimeStamp
	expiresAfterMS?: DOMHighResTimeStamp
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

export type BonusEntry = [label: BonusLabelKey, variables: BonusVariable[]]

export interface ShieldData {
	id?: string
	activatesAfterMS?: DOMHighResTimeStamp
	isSpellShield?: boolean
	amount: number
	repeatAmount?: number
	expiresAfterMS?: DOMHighResTimeStamp
	repeatsEveryMS?: DOMHighResTimeStamp
	bonusDamage?: SpellCalculation
	onRemoved?: (elapsedMS: DOMHighResTimeStamp, shield: ShieldData) => void
}

export interface ShieldEntry {
	id?: string
	source: ChampionUnit | undefined
	activated?: boolean
	activatesAtMS?: DOMHighResTimeStamp
	isSpellShield?: boolean
	amount: number
	repeatAmount?: number
	expiresAtMS?: DOMHighResTimeStamp
	repeatsEveryMS?: DOMHighResTimeStamp
	bonusDamage?: SpellCalculation
	onRemoved?: (elapsedMS: DOMHighResTimeStamp, shield: ShieldData) => void
}

export type EffectResults = BonusVariable[] | void
