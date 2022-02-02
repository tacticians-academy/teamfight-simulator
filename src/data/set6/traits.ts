import type { TraitData } from '#/helpers/types'

export enum TraitKey {
	Arcanist = 'Arcanist', Assassin = 'Assassin', Bodyguard = 'Bodyguard', Bruiser = 'Bruiser', Challenger = 'Challenger', Chemtech = 'Chemtech', Clockwork = 'Clockwork', Colossus = 'Colossus', Debonair = 'Debonair', Enchanter = 'Enchanter', Enforcer = 'Enforcer', Glutton = 'Glutton', Hextech = 'Hextech', Innovator = 'Innovator', Mastermind = 'Mastermind', Mercenary = 'Mercenary', Mutant = 'Mutant', Rivals = 'Rivals', Scholar = 'Scholar', Scrap = 'Scrap', Sniper = 'Sniper', Socialite = 'Socialite', Striker = 'Striker', Syndicate = 'Syndicate', Transformer = 'Transformer', Twinshot = 'Twinshot', Yordle = 'Yordle', YordleLord = 'YordleLord'
}

export const traits: TraitData[] = [
	{
		"apiName": "Set6_Rivals",
		"desc": "This trait is only active when you have exactly 1 unique Rival unit, as Rivals refuse to work together.<br><br>Vi's mana cost is reduced by @ViManaReduction@.<br><br>Jinx gains @JinxEmpoweredAS*100@% Attack Speed for @JinxASDuration@ seconds after scoring a takedown.",
		"effects": [
			{
				"maxUnits": 1,
				"minUnits": 1,
				"style": 3,
				"variables": {
					"JinxASDuration": 3,
					"ViPunchRange": 4,
					"JinxEmpoweredAS": 0.4000000059604645,
					"ViManaReduction": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Rivals.tex",
		"name": "Rival"
	},
	{
		"apiName": "Set6_Syndicate",
		"desc": "Certain allies are cloaked in shadows, gaining @Armor@ Armor, @MR@ Magic Resist and @PercentOmnivamp@% Omnivamp (healing for a percentage of all damage dealt.)<br><br><row>(@MinUnits@) The Syndicate champion with the lowest percent HP</row><br><row>(@MinUnits@) All Syndicate champions</row><br><row>(@MinUnits@) Your whole team, and the effects are increased by @SyndicateIncrease*100@%</row><br>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"Armor": 55,
					"MR": 55,
					"Colossus/Mutant/Socialite": 1,
					"PercentOmnivamp": 20
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"Armor": 55,
					"MR": 55,
					"Colossus/Mutant/Socialite": 2,
					"PercentOmnivamp": 20
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"Armor": 55,
					"MR": 55,
					"Colossus/Mutant/Socialite": 3,
					"SyndicateIncrease": 0.6000000238418579,
					"PercentOmnivamp": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Syndicate.tex",
		"name": "Syndicate"
	},
	{
		"apiName": "Set6_Yordle",
		"desc": "<row>(@MinUnits@) After each player combat, a random Yordle is added to your bench for free.</row><br><row>(@MinUnits@) And Yordles' Abilities cost @PercentManaReduction@% less to cast.</row><br>",
		"effects": [
			{
				"maxUnits": 5,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"PercentManaReduction": null
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"PercentManaReduction": 25
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Yordle.tex",
		"name": "Yordle"
	},
	{
		"apiName": "Set6_Scrap",
		"desc": "At the start of combat, components held by Scrap champions turn into full items for the rest of combat. Also, your team gains a shield for each component equipped by your team, including those that are part of a full item.<br><br><row>(@MinUnits@) @NumComponents@ component, @HPShieldAmount@ shield</row><br><row>(@MinUnits@) @NumComponents@ components, @HPShieldAmount@ shield</row><br><row>(@MinUnits@) All components, @HPShieldAmount@ shield</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"NumComponents": 1,
					"HPShieldAmount": 20
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"NumComponents": 3,
					"HPShieldAmount": 40
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"NumComponents": 10,
					"HPShieldAmount": 60
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scrap.tex",
		"name": "Scrap"
	},
	{
		"apiName": "Set6_Challenger",
		"desc": "Challengers get bonus Attack Speed. Upon scoring a takedown, Challengers dash to a new target and double this bonus for @BurstDuration@ seconds.<br><expandRow>(@MinUnits@) @BonusAS@% Attack Speed</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusAS": 30,
					"BurstDuration": 2.5
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"BonusAS": 60,
					"BurstDuration": 2.5
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusAS": 90,
					"BurstDuration": 2.5
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusAS": 150,
					"BurstDuration": 2.5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Challenger.tex",
		"name": "Challenger"
	},
	{
		"apiName": "Set6_Enchanter",
		"desc": "Your team has bonus Magic Resist. Enchanters gain bonus healing and shielding.<br><expandRow>(@MinUnits@) @MRance@ Magic Resist; @HealShieldBoost*100@% healing and shielding</expandRow><br>",
		"effects": [
			{
				"maxUnits": 2,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"MR": 20,
					"HealShieldBoost": 0.25
				}
			},
			{
				"maxUnits": 3,
				"minUnits": 3,
				"style": 2,
				"variables": {
					"MR": 35,
					"HealShieldBoost": 0.4000000059604645
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"MR": 50,
					"HealShieldBoost": 0.6000000238418579
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"MR": 75,
					"HealShieldBoost": 1
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enchanter.tex",
		"name": "Enchanter"
	},
	{
		"apiName": "Set6_YordleLord",
		"desc": "(1) Benefits from the Yordle trait.<br><br>Veigar is summoned from a Yordle Portal when every Yordle is 3-star.<br><br>",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 4,
				"variables": {}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_YordleLord.TFT_Set6.tex",
		"name": "Yordle-Lord"
	},
	{
		"apiName": "Set6_Bodyguard",
		"desc": "Bodyguards have increased Armor. Shortly after combat begins, Bodyguards gain a shield and taunt adjacent enemies, forcing them to attack the Bodyguard.<br><br><expandRow>(@MinUnits@) @Armor@ Armor, @ShieldAmount@ shield</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"Armor": 80,
					"ShieldAmount": 150
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"Armor": 160,
					"ShieldAmount": 350
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"Armor": 250,
					"ShieldAmount": 700
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"Armor": 450,
					"ShieldAmount": 1200
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Hero.tex",
		"name": "Bodyguard"
	},
	{
		"apiName": "Set6_Socialite",
		"desc": "Socialites reveal a spotlight on the battlefield. The unit standing in the spotlight at the start of combat gains unique bonuses.<br><br><row>(@MinUnits@) @DamagePercent*100@% bonus damage</row><br><row>(@MinUnits@) and @ManaPerSecond@ Mana per second</row><br><row>(@MinUnits@) and heal for @OmnivampPercent*100@% of all damage they deal</row><br><row>(@MinUnits@) all of the bonuses are doubled</row>",
		"effects": [
			{
				"maxUnits": 1,
				"minUnits": 1,
				"style": 1,
				"variables": {
					"DamagePercent": 0.15000000596046448,
					"{5064373e}": null,
					"Colossus/Mutant/Socialite": 1,
					"OmnivampPercent": null,
					"ManaPerSecond": null
				}
			},
			{
				"maxUnits": 2,
				"minUnits": 2,
				"style": 2,
				"variables": {
					"DamagePercent": 0.25,
					"{5064373e}": null,
					"Colossus/Mutant/Socialite": 2,
					"OmnivampPercent": null,
					"ManaPerSecond": 4
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 3,
				"variables": {
					"DamagePercent": 0.25,
					"{5064373e}": null,
					"Colossus/Mutant/Socialite": 3,
					"OmnivampPercent": 0.33000001311302185,
					"ManaPerSecond": 4
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"DamagePercent": 0.5,
					"{5064373e}": null,
					"Colossus/Mutant/Socialite": 4,
					"OmnivampPercent": 0.6600000262260437,
					"ManaPerSecond": 8
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Socialite.tex",
		"name": "Socialite"
	},
	{
		"apiName": "Set6_Mutant",
		"desc": "Mutants gain a different Trait bonus from game to game.<br><br><tftstrong>Cybernetic Enhancement</tftstrong> grants bonus stats to Mutants with at least 1 item.<br><tftstrong>Voracious Appetite</tftstrong> strengthens Mutants on each ally's death.<br><tftstrong>Voidborne</tftstrong> executes targets below a HP threshold and deals true damage. <br><tftstrong>Hyper-Adrenal Glands</tftstrong> give a chance for Mutants to deal additional attacks.<br><tftstrong>Synaptic Web</tftstrong> reduces the Mana cost of Mutants' Abilities.<br><tftstrong>Bio-Leeching</tftstrong> grants Omnivamp (healing for a percentage of damage dealt) to your team.<br><tftstrong>Metamorphosis</tftstrong> grants stacking bonuses to Mutants at regular intervals.",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"{02ce80f2}": 8,
					"MutantMetamorphosisArmorMR": 18,
					"{2f805979}": 30,
					"{2fb1d11d}": 0.019999999552965164,
					"{3f1cec4d}": 20,
					"Colossus/Mutant/Socialite": 1,
					"{66d8ecb1}": 50,
					"{6b5aee70}": 2,
					"MutantCyberHP": 450,
					"{7c799240}": 20,
					"{7f322ebf}": null,
					"{82e43c84}": 20,
					"{994006f0}": 2,
					"{9cc303b4}": null,
					"{b6322d58}": 30,
					"{c26236e7}": 40,
					"{f3cab19f}": 175,
					"{f90dd382}": null
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"{02ce80f2}": 12,
					"MutantMetamorphosisArmorMR": 25,
					"{2f805979}": 55,
					"{2fb1d11d}": 0.029999999329447746,
					"{3f1cec4d}": 20,
					"Colossus/Mutant/Socialite": 2,
					"{66d8ecb1}": 50,
					"{6b5aee70}": 2,
					"MutantCyberHP": 900,
					"{7c799240}": 30,
					"{7f322ebf}": null,
					"{82e43c84}": 40,
					"{994006f0}": 4,
					"{9cc303b4}": 40,
					"{b6322d58}": 60,
					"{c26236e7}": 75,
					"{f3cab19f}": 225,
					"{f90dd382}": null
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"{02ce80f2}": 8,
					"MutantMetamorphosisArmorMR": 40,
					"{2f805979}": 90,
					"{2fb1d11d}": 0.03999999910593033,
					"{3f1cec4d}": 20,
					"Colossus/Mutant/Socialite": 3,
					"{66d8ecb1}": 50,
					"{6b5aee70}": 2,
					"MutantCyberHP": 1500,
					"{7c799240}": 45,
					"{7f322ebf}": 40,
					"{82e43c84}": 40,
					"{994006f0}": 7,
					"{9cc303b4}": 100,
					"{b6322d58}": 100,
					"{c26236e7}": 100,
					"{f3cab19f}": 175,
					"{f90dd382}": 60
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Experimental.tex",
		"name": "Mutant"
	},
	{
		"apiName": "Set6_Mastermind",
		"desc": "At the start of combat, the Mastermind grants the 2 allies directly in front of him @ManaGrant@% of their maximum Mana.",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 3,
				"variables": {
					"ManaGrant": 40
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Mastermind.tex",
		"name": "Mastermind"
	},
	{
		"apiName": "Set6_Mercenary",
		"desc": "Gain a treasure chest that opens when you win combat against a player. At the start of each planning phase vs a player, dice rolls add loot to the chest. The longer you've gone without opening the chest, the luckier the dice.<br><br><row>(@MinUnits@) Roll 2 dice </row><br><row>(@MinUnits@) The dice are even luckier! </row><br><row>(@MinUnits@) Upon winning, roll a 3rd die that grants bonus loot. </row>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Mercenary.tex",
		"name": "Mercenary"
	},
	{
		"apiName": "Set6_Glutton",
		"desc": "An ally from the bench can be fed to Tahm Kench once per planning phase, permanently granting him either Ability Power, HP, Armor, or Magic Resist.<br><br><tftitemrules>To feed, hold an ally from the bench over Tahm Kench until his mouth opens, then release.</tftitemrules>",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 3,
				"variables": {}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Glutton.tex",
		"name": "Glutton"
	},
	{
		"apiName": "Set6_Scholar",
		"desc": "Your team gains Mana every @TickRate@ seconds.<br><br><expandRow>(@MinUnits@) @ManaPerTick@ Mana</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"TickRate": 2,
					"ManaPerTick": 5
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"TickRate": 2,
					"ManaPerTick": 10
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"TickRate": 2,
					"ManaPerTick": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scholar.tex",
		"name": "Scholar"
	},
	{
		"apiName": "Set6_Innovator",
		"desc": "Innovators build a mechanical companion to join the battle. The companion receives bonus HP and Attack Damage based on allied Innovators' star levels. <br><br><row>(@MinUnits@) Mechanical Scarab </row><br><row>(@MinUnits@) Mechanical Bear</row><br><row>(@MinUnits@) Mechanical Dragon </row>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"InnovationStarLevel": 1,
					"InnovatorStarLevelMultiplier": 0.25
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"InnovationStarLevel": 2,
					"InnovatorStarLevelMultiplier": 0.25
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"InnovationStarLevel": 3,
					"InnovatorStarLevelMultiplier": 0.25
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Innovator.tex",
		"name": "Innovator"
	},
	{
		"apiName": "Set6_Hextech",
		"desc": "At the start of combat and every @Frequency@ seconds afterwards, the Hexcore sends out a pulse that charges up allied Hextech champions with a shield for @ShieldDuration@ seconds. While the shield is active, attacks deal bonus magic damage on hit. This shield does not stack.<br><br><expandRow>(@MinUnits@) @ShieldAmount@ shield, @MagicDamage@ magic damage</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"MagicDamage": 10,
					"ShieldAmount": 160,
					"ShieldDuration": 4,
					"Frequency": 6
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"MagicDamage": 40,
					"ShieldAmount": 240,
					"ShieldDuration": 4,
					"Frequency": 6
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"MagicDamage": 80,
					"ShieldAmount": 480,
					"ShieldDuration": 4,
					"Frequency": 6
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"MagicDamage": 140,
					"ShieldAmount": 800,
					"ShieldDuration": 4,
					"Frequency": 6
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_Hextech.tex",
		"name": "Hextech"
	},
	{
		"apiName": "Set6_Twinshot",
		"desc": "Twinshots gain bonus Attack Damage. When a Twinshot attacks, they have a chance to attack twice instead.<br><br><expandRow>(@MinUnits@) @BonusAD@ Attack Damage, @ProcChance@% chance</expandRow><br>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusAD": 5,
					"ProcChance": 40
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"BonusAD": 40,
					"ProcChance": 70
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"BonusAD": 80,
					"ProcChance": 100
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Twinshot.tex",
		"name": "Twinshot"
	},
	{
		"apiName": "Set6_Transformer",
		"desc": "Jayce adopts melee form when placed in the front 2 rows, and ranged form in the back 2 rows.",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 3,
				"variables": {}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Transformer.tex",
		"name": "Transformer"
	},
	{
		"apiName": "Set6_Bruiser",
		"desc": "Your team gains bonus maximum HP. Bruisers gain double the bonus.<br><expandRow>(@MinUnits@) @BonusHealth@ Health</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusHP": 125
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"BonusHP": 225
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusHP": 400
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusHP": 700
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Bruiser.tex",
		"name": "Bruiser"
	},
	{
		"apiName": "Set6_Assassin",
		"desc": "Innate: When combat starts, Assassins leap to the enemy backline.<br><br>Assassins' Abilities can critically strike and they gain bonus Critical Strike Chance and bonus Critical Strike Damage.<br><br><expandRow>(@MinUnits@) +@CritChanceAmpPercent@% Crit Chance and +@CritAmpPercent@% Crit Damage</expandRow><br>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"CritAmpPercent": 20,
					"CritChanceAmpPercent": 10
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"CritAmpPercent": 40,
					"CritChanceAmpPercent": 30
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"CritAmpPercent": 60,
					"CritChanceAmpPercent": 50
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Assassin.tex",
		"name": "Assassin"
	},
	{
		"apiName": "Set6_Colossus",
		"desc": "Innate: Colossi are bigger and more powerful. They gain @BonusHPTooltip@ bonus Health and immunity to crowd control effects. However, each Colossus requires 2 team slots.<br><row>(@MinUnits@) Colossus champions take @DamageReduction*100@% less damage</row>",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 2,
				"style": 3,
				"variables": {
					"DamageReduction": 0.25,
					"Colossus/Mutant/Socialite": 2,
					"BonusHPTooltip": 800
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Colossus.tex",
		"name": "Colossus"
	},
	{
		"apiName": "Set6_Debonair",
		"desc": "Debonair champions gain bonus HP and Ability Power, and you have a higher chance to see Debonair VIPs in your Shop. <br><br>If there is a Debonair VIP in play, they activate their unique bonus. Sell the old VIP for a chance to see a new one in your Shop. <br><br><expandRow>(@MinUnits@) @Health@ Health, @AP@ Ability Power </expandRow>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"HP": 200,
					"AP": 20
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"HP": 600,
					"AP": 60
				}
			},
			{
				"maxUnits": 8,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"HP": 1000,
					"AP": 100
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Debonair.tex",
		"name": "Debonair"
	},
	{
		"apiName": "Set6_Arcanist",
		"desc": "Arcanists increase the Ability Power of your team.<br><row>(@MinUnits@) Your team gains @TeamAP@ Ability Power</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power, Arcanists gain an additional @ArcanistAbilityPower@</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power, Arcanists gain an additional @ArcanistAbilityPower@</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"TeamAP": 20,
					"ArcanistAP": null
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"TeamAP": 20,
					"ArcanistAP": 40
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"TeamAP": 50,
					"ArcanistAP": 50
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"TeamAP": 145,
					"ArcanistAP": null
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Arcanist.tex",
		"name": "Arcanist"
	},
	{
		"apiName": "Set6_Sniper",
		"desc": "Innate: Snipers gain @HexRangeIncrease@ hex Attack Range. <br><br>Snipers deal bonus damage for each hex between themselves and their target.<br><expandRow>(@MinUnits@) @PercentDamageIncrease@% bonus damage</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"HexRangeIncrease": 1,
					"PercentDamageIncrease": 8
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"HexRangeIncrease": 1,
					"PercentDamageIncrease": 16
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"HexRangeIncrease": 1,
					"PercentDamageIncrease": 30
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Sniper.tex",
		"name": "Sniper"
	},
	{
		"apiName": "Set6_Striker",
		"desc": "Strikers gain bonus Attack Damage.<br><expandRow>(@MinUnits@) +@BonusAD@ Attack Damage</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusAD": 40
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"BonusAD": 75
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"BonusAD": 110
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Striker.tex",
		"name": "Striker"
	},
	{
		"apiName": "Set6_Clockwork",
		"desc": "Your team has increased Attack Speed, with an additional increase per augment in the Hexcore.<br><br><expandRow>(@MinUnits@) @ASBonus*100@% Attack Speed + @BonusPerAugment*100@% per augment </expandRow><br><br>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusPerAugment": 0.05000000074505806,
					"ASBonus": 0.10000000149011612
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"BonusPerAugment": 0.10000000149011612,
					"ASBonus": 0.3499999940395355
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"BonusPerAugment": 0.15000000596046448,
					"ASBonus": 0.699999988079071
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Clockwork.tex",
		"name": "Clockwork"
	},
	{
		"apiName": "Set6_Enforcer",
		"desc": "Enforcers stun enemies at the start of combat. The target breaks free after @DetainDuration@ seconds, or after losing @HPPercent*100@% of their maximum HP. Enforcers will not try to stun enemies who are immune to crowd control effects.<br><br><row>(@MinUnits@) The enemy who has the most Health</row><br><row>(@MinUnits@) And the enemy who dealt the most damage last combat</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"HPPercent": 0.4000000059604645,
					"DetainDuration": 5,
					"DetainCount": 1
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"HPPercent": 0.4000000059604645,
					"DetainDuration": 5,
					"DetainCount": 2
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enforcer.tex",
		"name": "Enforcer"
	},
	{
		"apiName": "Set6_Chemtech",
		"desc": "After dropping below @HPThreshold@% Health, Chemtech champions become chem-powered, gaining Attack Speed, @DamageReduction@% damage reduction, and regenerating a percentage of their maximum Health each second for @Duration@ seconds.<br><br><expandRow>(@MinUnits@) @AS@% Attack Speed, @HealthRegen@% Health</expandRow>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"AS": 15,
					"DamageReduction": 20,
					"Duration": 8,
					"HPRegen": 4,
					"HPThreshold": 75
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 2,
				"variables": {
					"AS": 40,
					"DamageReduction": 20,
					"Duration": 8,
					"HPRegen": 8,
					"HPThreshold": 75
				}
			},
			{
				"maxUnits": 8,
				"minUnits": 7,
				"style": 3,
				"variables": {
					"AS": 80,
					"DamageReduction": 20,
					"Duration": 8,
					"HPRegen": 12,
					"HPThreshold": 75
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 9,
				"style": 4,
				"variables": {
					"AS": 150,
					"DamageReduction": 20,
					"Duration": 8,
					"HPRegen": 18,
					"HPThreshold": 75
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Chemtech.tex",
		"name": "Chemtech"
	}
]