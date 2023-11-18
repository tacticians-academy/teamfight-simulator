import type { AugmentGroupKey, ChampionSpellMissileData, ItemKey, TraitKey } from '@tacticians-academy/academy-library'
import type { BonusKey, DamageType, SpellCalculation, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import type { AttackBounce, GameEffect } from '#/sim/effects/GameEffect'
import type { HexEffectData } from '#/sim/effects/HexEffect'

export type HexCoord = [col: number, row: number]

export type StarLevel = 1 | 2 | 3 | 4
export type TeamNumber = 0 | 1

export interface HexRowCol {
	hex: HexCoord
	coord: HexCoord
}

export const enum DamageSourceType {
	attack = 'attack', spell = 'spell', bonus = 'bonus'
}

export interface DamageResult {
	isOriginalSource: boolean
	sourceType: DamageSourceType
	damageType: DamageType | undefined
	rawDamage: number
	takingDamage: number
	didCrit: boolean
	[BonusKey.ArmorShred]: number
	[BonusKey.MagicResistShred]: number
}

export type ActivateFn = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
export type CollisionFn = (elapsedMS: DOMHighResTimeStamp, effect: GameEffect, withUnit: ChampionUnit, damage?: DamageResult) => void
export type DamageFn = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, damage: DamageResult) => void

export interface DamageModifier {
	increase?: number
	multiplier?: number
	critChance?: number
	damageType?: DamageType
	alwaysCrits?: boolean
	ignoresInvulnerability?: boolean
	onModifyDamage?: DamageFn
}

export interface SynergyData {
	key: TraitKey
	trait: TraitData
	activeStyle: number
	activeEffect: TraitEffectData | undefined
	uniqueUnitNames: string[]
}

export enum StatusEffectType {
	ablaze = 'ablaze',
	aoeDamageReduction = 'aoeDamageReduction',
	armorReduction = 'armorReduction',
	attackSpeedSlow = 'attackSpeedSlow',
	banished = 'banished',
	ccImmune = 'ccImmune',
	disarm = 'disarm',
	empowered = 'empowered',
	grievousWounds = 'grievousWounds',
	invulnerable = 'invulnerable',
	magicResistReduction = 'magicResistReduction',
	stealth = 'stealth',
	stunned = 'stunned',
	unstoppable = 'unstoppable',
}

export type StatusEffectData = [StatusEffectType, {
	durationMS: DOMHighResTimeStamp
	amount?: number
}]

export interface StatusEffect {
	active: boolean
	expiresAtMS: DOMHighResTimeStamp
	amount: number
}
export type StatusEffects = Record<StatusEffectType, StatusEffect>

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

export type BonusLabelKey = AugmentGroupKey | string | TraitKey | ItemKey | SpellKey | MutantType

export type BonusVariable = [key: string, value: number | null, expiresAtMS?: DOMHighResTimeStamp]

export interface BonusScaling {
	source: ChampionUnit | undefined
	sourceID: BonusLabelKey
	activatedAtMS: DOMHighResTimeStamp
	expiresAfterMS?: DOMHighResTimeStamp
	stats: BonusKey[]
	intervalAmount?: number
	calculateAmount?: (elapsedMS: DOMHighResTimeStamp) => number
	intervalSeconds: number
}

export interface BleedData {
	sourceID: string
	source: ChampionUnit | undefined
	damageCalculation: SpellCalculation
	damageModifier?: DamageModifier
	activatesAtMS: DOMHighResTimeStamp
	repeatsEveryMS: DOMHighResTimeStamp
	remainingIterations: number
	onDeath?: ActivateFn
}

export type BonusEntry = [label: BonusLabelKey, variables: BonusVariable[]]

export interface ShieldEntry {
	id?: string
	source: ChampionUnit | undefined
	activated?: boolean
	activatesAtMS?: DOMHighResTimeStamp
	type?: 'spellShield' | 'barrier'
	amount?: number
	damageReduction?: number
	repeatAmount?: number
	expiresAtMS?: DOMHighResTimeStamp
	repeatsEveryMS?: DOMHighResTimeStamp
	bonusDamage?: SpellCalculation
	onRemoved?: (elapsedMS: DOMHighResTimeStamp, shield: ShieldEntry) => void
}

export interface ShieldData {
	id?: string
	activatesAfterMS?: DOMHighResTimeStamp
	isBarrier?: boolean
	type?: 'spellShield' | 'barrier'
	amount?: number
	damageReduction?: number
	repeatAmount?: number
	expiresAfterMS?: DOMHighResTimeStamp
	repeatsEveryMS?: DOMHighResTimeStamp
	bonusDamage?: SpellCalculation
	onRemoved?: (elapsedMS: DOMHighResTimeStamp, shield: ShieldEntry) => void
}

export interface EmpoweredAuto {
	id?: BonusLabelKey
	amount: number
	activatesAfterAmount?: number
	nthAuto?: number
	expiresAtMS?: DOMHighResTimeStamp
	bounce?: AttackBounce
	damageCalculation?: SpellCalculation
	bonusCalculations?: SpellCalculation[]
	damageModifier?: DamageModifier
	bonuses?: [BonusLabelKey, ...BonusVariable[]]
	missile?: ChampionSpellMissileData
	returnMissile?: ChampionSpellMissileData
	returnDoesNotTrack?: boolean
	stackingDamageModifier?: DamageModifier
	destroysOnCollision?: boolean
	statusEffects?: StatusEffectData[]
	hexEffect?: HexEffectData
	onActivate?: ActivateFn
	onCollided?: CollisionFn
}

export interface StackData {
	amount: number
	icon?: string
	max?: number
	isBoolean?: boolean
	onUpdate?: (event: Event) => void
	onAfterUpdate?: (unit: ChampionUnit) => void
}
