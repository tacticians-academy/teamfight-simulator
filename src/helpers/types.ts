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
}

export type UnitLevelStats = [number, number?, number?]

export const enum DamageType {
	physical, magic, true
}

export const enum BonusKey {
	HexRangeIncrease = 'HexRangeIncrease'
}

export interface ChampionAbilityVariable {
	name: string
	value: number[] | null
}
export interface ChampionAbility {
	desc: string | null
	icon: string
	name: string | null
	variables: ChampionAbilityVariable[]
}

export interface ChampionData {
	ability: ChampionAbility
	apiName: string
	cost: number
	icon: string
	name: string
	stats: {
		armor: number
		attackSpeed: number
		critChance: number | null
		critMultiplier: number
		damage: number
		hp: number
		initialMana: number
		magicResist: number
		mana: number
		range: number
	},
	traits: string[]
}

export interface TraitEffectata {
	maxUnits: number
	minUnits: number
	style: number
	variables: Record<string, number | null>
}
export interface TraitData {
	apiName: string
	desc: string
	effects: TraitEffectata[]
	icon: string
	name: string
}

export type SynergyCount = Map<TraitData, string[]>

export type SynergyData = [trait: TraitData, activeStyle: number, activeEffect: TraitEffectata | undefined, uniqueUnitNames: string[]]

export interface ItemData {
	desc: string
	effects: Record<string, number>
	from: number[]
	icon: string
	id: number
	name: string
	unique: boolean
}
