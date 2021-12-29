import { UnitTrait } from '#/game/types'

export const syndicate: UnitTrait = {
	description: "Certain allies are cloaked in shadows, gaining 50 Armor, 50 Magic Resist and 20% Omnivamp (healing for a percentage of all damage dealt.)",
	thresholds: [
		[3, "The Syndicate champion with the lowest percent Health"],
		[5, "All Syndicate champions"],
		[7, "Your whole team, and the effects are increased by 33%"],
	],
}

export const assassin: UnitTrait = {
	description: "Innate: When combat starts, Assassins leap to the enemy backline. Assassins' Abilities can critically strike and they gain bonus Critical Strike Chance and Critical Strike Damage.",
	thresholds: [
		[3, "+10% Crit Chance and +20% Crit Damage"],
		[4, "+30% Crit Chance and +40% Crit Damage"],
		[6, "+50% Crit Chance and +60% Crit Damage"],
	],
}

export const bodyguard: UnitTrait = {
	description: "Bodyguards have increased Armor. Shortly after combat begins, Bodyguards gain a shield and taunt adjacent enemies, forcing them to attack the Bodyguard.",
	thresholds: [
		[2, "100 Armor, 100 Shield"],
		[4, "200 Armor, 300 Shield"],
		[6, "350 Armor, 600 Shield"],
		[8, "500 Armor, 1000 Shield"],
	],
}

export const challenger: UnitTrait = {
	description: "Challengers get bonus Attack Speed. Upon scoring a takedown, Challengers dash to a new target and double this bonus for 2.5 seconds.",
	thresholds: [
		[2, "30% Attack Speed"],
		[4, "55% Attack Speed"],
		[6, "80% Attack Speed"],
		[8, "130% Attack Speed"],
	],
}

export const clockwork: UnitTrait = {
	description: "Your team has increased Attack Speed, with an increase per augment in the Hexcore.",
	thresholds: [
		[2, "10% Attack Speed + 5% per augment."],
		[4, "35% Attack Speed + 10% per augment."],
		[6, "70% Attack Speed + 15% per augment."],
	],
}

export const enforcer: UnitTrait = {
	description: "Enforcers stun enemies at the start of combat. They break free after 5 seconds, or after losing 40% or their maximum Health.",
	thresholds: [
		[2, "The enemy who has the most Health"],
		[4, "The enemy who dealt the most damage last combat"],
	],
}

export const protector: UnitTrait = {
	description: "Protectors shield themselves for 4 seconds whenever they cast an Ability. This shield doesn't stack.",
	thresholds: [
		[2, "20% Maximum Health Shield"],
		[3, "35% Maximum Health Shield"],
		[4, "45% Maximum Health Shield"],
		[5, "60% Maximum Health Shield"],
	],
}

export const scrap: UnitTrait = {
	description: "At the start of combat, components held by Scrap champions turn into full items for the rest of combat. Additionally, your team also gains Health for each component equipped in your army, including those that are part of a full item.",
	thresholds: [
		[2, "1 component, 20 health"],
		[4, "3 components, 35 health"],
		[6, "All components, 60 health]"],
	],
}

export const sniper: UnitTrait = {
	description: "Snipers gain +1 Attack Range and deal bonus damage for each hex between themselves and their target.",
	thresholds: [
		[2, "8% bonus damage"],
		[4, "16% bonus damage"],
		[6, "30% bonus damage"],
	],
}
