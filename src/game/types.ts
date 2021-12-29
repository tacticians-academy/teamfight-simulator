export type HexCoord = [col: number, row: number]

export type UnitLevelStats = [number, number?, number?]

export type StarLevel = 1 | 2 | 3 | 4

export interface UnitTrait {
	description: string
	thresholds: [number, string][]
}

export interface UnitAbility {
	name: string
	manaStart: number
	manaMax: number
	description: string
	damage?: UnitLevelStats
	shield?: UnitLevelStats
	stun?: UnitLevelStats
	knockup?: UnitLevelStats
	focus?: boolean
	empoweredAuto?: {
		while?: 'shielded'
		heal?: UnitLevelStats
		stun?: UnitLevelStats
		knockup?: UnitLevelStats
	}
}

export interface UnitStats {
	name: string
	cost: number
	attack: number
	attackSpeed: number
	range: 1 | 2 | 3 | 4 | 5 | 6
	health: number
	armor: number
	magicResist: number
	traits: UnitTrait[]
	ability: UnitAbility
}
