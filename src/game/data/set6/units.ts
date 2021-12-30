import { assassin, bodyguard, challenger, clockwork, enforcer, protector, scrap, sniper, syndicate } from '#/game/data/set6/traits'
import type { UnitStats } from '#/game/types'

export const akali: UnitStats = {
	name: "Akali",
	cost: 5,
	health: 850,
	attack: 70,
	attackSpeed: 0.9,
	range: 1,
	armor: 30,
	magicResist: 30,
	traits: [syndicate, assassin],
	ability: {
		name: "Perfect Execution",
		target: 'most',
		manaStart: 0,
		manaMax: 40,
		description: "Akali dashes in a line through the most enemies, dealing magic damage and marking them for 7 seconds. When a marked target drops below Health threshold, Akali dashes again and executes them, dealing magic damage to enemies she passes through.",
		damage: [275, 375, 2000],
		// markedDamage: [250, 325, 2000],
		// recastExecute: [0.15, 0.20, 0.90],
	},
}

export const blitzcrank: UnitStats = {
	name: "Blitzcrank",
	cost: 2,
	health: 650,
	attack: 65,
	attackSpeed: 0.5,
	range: 1,
	armor: 45,
	magicResist: 45,
	traits: [scrap, bodyguard, protector],
	ability: {
		name: "Rocket Grab",
		target: 'farthest',
		manaStart: 175,
		manaMax: 175,
		description: "Blitzcrank pulls the farthest enemy, dealing magic damage and stunning them for 1.5 seconds. His next attack after pulling knocks up for 1 second. Allies within range will prefer attacking Blitzcrank's target.",
		damage: [150, 300, 900],
		stun: [1.5],
		focus: true,
		empoweredAuto: {
			knockup: [1.0],
		},
	},
}

export const braum: UnitStats = {
	name: "Braum",
	cost: 4,
	health: 1100,
	attack: 70,
	attackSpeed: 0.6,
	range: 1,
	armor: 60,
	magicResist: 60,
	traits: [syndicate, bodyguard],
	ability: {
		name: "Vault Breaker",
		target: 'current',
		manaStart: 100,
		manaMax: 180,
		description: "Braum slams his vault door into the ground, creating a fissure towards his target. Enemies within 2 hexes of Braum and those struck by the fissure are stunned for a few seconds and take magic damage.",
		damage: [100, 200, 600],
		stun: [2, 3, 6],
	},
}

export const caitlyn: UnitStats = {
	name: "Caitlyn",
	cost: 1,
	attack: 50,
	attackSpeed: 0.75,
	range: 4,
	health: 500,
	armor: 15,
	magicResist: 15,
	traits: [enforcer, sniper],
	ability: {
		name: "Ace in the Hole",
		target: 'farthest',
		manaStart: 0,
		manaMax: 110,
		description: "Caitlyn takes aim at the farthest enemy, firing a deadly bullet towards them that deals magic damage to the first enemy it hits.",
		damage: [800, 1400, 2250],
	},
}

export const camille: UnitStats = {
	name: "Camille",
	cost: 1,
	attack: 50,
	attackSpeed: 0.6,
	range: 1,
	health: 500,
	armor: 40,
	magicResist: 40,
	traits: [clockwork, challenger],
	ability: {
		name: "Defensive Sweep",
		target: 'current',
		manaStart: 0,
		manaMax: 60,
		description: "Camille gains a shield blocking damage over 4 seconds, then sweeps her leg, dealing magic damage to enemies in a cone. While this shield holds, Camille's attacks restore Health.",
		damage: [150, 200, 300],
		shield: [225, 300, 435],
		empoweredAuto: {
			while: 'shielded',
			heal: [30, 50, 80],
		},
	},
}

export const allUnits: UnitStats[] = [akali, blitzcrank, braum, caitlyn, camille]
