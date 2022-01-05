import type { TraitData } from '#/helpers/types'

export enum TraitKey {
	Academy = 'Academy', Arcanist = 'Arcanist', Assassin = 'Assassin', Bodyguard = 'Bodyguard', Bruiser = 'Bruiser', Challenger = 'Challenger', Chemtech = 'Chemtech', Clockwork = 'Clockwork', Colossus = 'Colossus', Cuddly = 'Cuddly', Enchanter = 'Enchanter', Enforcer = 'Enforcer', Glutton = 'Glutton', Imperial = 'Imperial', Innovator = 'Innovator', Mercenary = 'Mercenary', Mutant = 'Mutant', Protector = 'Protector', Scholar = 'Scholar', Scrap = 'Scrap', Sister = 'Sister', Sniper = 'Sniper', Socialite = 'Socialite', Syndicate = 'Syndicate', Transformer = 'Transformer', Twinshot = 'Twinshot', Yordle = 'Yordle', YordleLord = 'YordleLord'
}

export const traits: TraitData[] = [
	{
		"apiName": "Set6_Syndicate",
		"desc": "Certain allies are cloaked in shadows, gaining @Armor@ Armor, @MagicResist@ Magic Resist and @PercentOmnivamp@% Omnivamp (healing for a percentage of all damage dealt.)<br><br><row>(@MinUnits@) The Syndicate champion with the lowest percent Health</row><br><row>(@MinUnits@) All Syndicate champions</row><br><row>(@MinUnits@) Your whole team, and the effects are increased by @SyndicateIncrease*100@%</row><br>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"Armor": 60,
					"MagicResist": 60,
					"{5c51b509}": 1,
					"{c9b0e3af}": 20
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"Armor": 60,
					"MagicResist": 60,
					"{5c51b509}": 2,
					"{c9b0e3af}": 20
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"Armor": 60,
					"MagicResist": 60,
					"{5c51b509}": 3,
					"{c9b0e3af}": 20,
					"SyndicateIncrease": 0.33000001311302185
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Syndicate.dds",
		"name": "Syndicate"
	},
	{
		"apiName": "Set6_Sister",
		"desc": "(@MinUnits@) Sisters gain empowered skills to compete with each other. <br>Vi's Ability range increases by 2 hexes.<br><br>Jinx gains @JinxEmpoweredAS*100@% Attack Speed for @JinxASDuration@ seconds after scoring a takedown.",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 2,
				"style": 3,
				"variables": {
					"JinxASDuration": 3,
					"{3b173c39}": 4,
					"JinxEmpoweredAS": 0.4000000059604645
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Sisters.dds",
		"name": "Sister"
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
					"PercentManaReduction": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Yordle.dds",
		"name": "Yordle"
	},
	{
		"apiName": "Set6_Academy",
		"desc": "Academics have bonus Attack Damage and Ability Power. They also learn from their allies, gaining an additional bonus whenever an ally casts their Ability.<br><br><expandRow>(@MinUnits@) @ADAPBase@ Attack Damage and Ability Power; @ADAPPerCast@ from allies' casts</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"ADAPBase": 18,
					"ADAPPerCast": 3
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"ADAPBase": 40,
					"ADAPPerCast": 5
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"ADAPBase": 50,
					"ADAPPerCast": 10
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"ADAPBase": 70,
					"ADAPPerCast": 15
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Academy.dds",
		"name": "Academy "
	},
	{
		"apiName": "Set6_Protector",
		"desc": "Protectors shield themselves for @Duration@ seconds whenever they cast an Ability. This shield doesn't stack.<br><br><expandRow> (@MinUnits@) @ShieldPercent@% maximum Health shield</expandRow>",
		"effects": [
			{
				"maxUnits": 2,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"Duration": 4,
					"ShieldPercent": 20
				}
			},
			{
				"maxUnits": 3,
				"minUnits": 3,
				"style": 2,
				"variables": {
					"Duration": 6,
					"ShieldPercent": 30
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"Duration": 6,
					"ShieldPercent": 40
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"Duration": 6,
					"ShieldPercent": 50
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_3_Protector.dds",
		"name": "Protector"
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
					"HPShieldAmount": 35
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scrap.dds",
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
					"BonusAS": 55,
					"BurstDuration": 2.5
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusAS": 80,
					"BurstDuration": 2.5
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusAS": 130,
					"BurstDuration": 2.5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Challenger.dds",
		"name": "Challenger"
	},
	{
		"apiName": "Set6_Enchanter",
		"desc": "Your team has bonus Magic Resist. Enchanters gain bonus healing and shielding.<br><expandRow>(@MinUnits@) +@MagicResistance@ Magic Resist; @HealShieldBoost*100@% healing and shielding</expandRow><br>",
		"effects": [
			{
				"maxUnits": 2,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"MagicResistance": 20,
					"HealShieldBoost": 0.25
				}
			},
			{
				"maxUnits": 3,
				"minUnits": 3,
				"style": 2,
				"variables": {
					"MagicResistance": 35,
					"HealShieldBoost": 0.4000000059604645
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"MagicResistance": 50,
					"HealShieldBoost": 0.6000000238418579
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"MagicResistance": 75,
					"HealShieldBoost": 1
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enchanter.dds",
		"name": "Enchanter"
	},
	{
		"apiName": "Set6_Cuddly",
		"desc": "At the start of combat, Yuumi attaches herself to the nearest ally, or to the lowest Health ally after being unattached for @AttachCooldown@ seconds. Attaching to an ally grants them a shield equal to @ShieldPercent@% of Yuumi's maximum Health. Yuumi detaches if the shield breaks.<br><br>While attached, Yuumi is untargetable and cannot attack, but gains @ManaPerSecond@ Mana per second, and @ManaPerAllyAttack@ Mana whenever the ally attacks.",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 3,
				"variables": {
					"AttachCooldown": 2,
					"ShieldPercent": 60,
					"ManaPerAllyAttack": 10,
					"ManaPerSecond": 5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Cuddly.TFT_Set6.dds",
		"name": "Cuddly"
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_YordleLord.TFT_Set6.dds",
		"name": "Yordle-Lord"
	},
	{
		"apiName": "Set6_Bodyguard",
		"desc": "Bodyguards have increased Armor. Shortly after combat begins, Bodyguards gain a Shield and taunt adjacent enemies, forcing them to attack the Bodyguard.<br><br><expandRow>(@MinUnits@) @BonusArmor@ Armor, @ShieldAmount@ Shield</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusArmor": 100,
					"ShieldAmount": 100
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"BonusArmor": 200,
					"ShieldAmount": 300
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusArmor": 350,
					"ShieldAmount": 600
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusArmor": 500,
					"ShieldAmount": 1000
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Hero.dds",
		"name": "Bodyguard"
	},
	{
		"apiName": "Set6_Socialite",
		"desc": "Socialites reveal a spotlight on the battlefield. The unit standing in the spotlight at the start of combat gains unique bonuses.<br><br><row>(@MinUnits@) @DamagePercent*100@% bonus damage</row><br><row>(@MinUnits@) and @ManaPerSecond@ Mana per second</row><br><row>(@MinUnits@) and heal for @OmnivampPercent*100@% of all damage they deal</row>",
		"effects": [
			{
				"maxUnits": 1,
				"minUnits": 1,
				"style": 1,
				"variables": {
					"DamagePercent": 0.20000000298023224,
					"{5064373e}": null,
					"{5c51b509}": 1,
					"OmnivampPercent": null,
					"ManaPerSecond": null
				}
			},
			{
				"maxUnits": 2,
				"minUnits": 2,
				"style": 2,
				"variables": {
					"DamagePercent": 0.20000000298023224,
					"{5064373e}": null,
					"{5c51b509}": 2,
					"OmnivampPercent": null,
					"ManaPerSecond": 5
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 3,
				"style": 3,
				"variables": {
					"DamagePercent": 0.20000000298023224,
					"{5064373e}": null,
					"{5c51b509}": 3,
					"OmnivampPercent": 0.30000001192092896,
					"ManaPerSecond": 5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Socialite.dds",
		"name": "Socialite"
	},
	{
		"apiName": "Set6_Mutant",
		"desc": "Mutants gain a different Trait bonus from game to game.<br><br><tftstrong>Cybernetic Enhancement</tftstrong> grants bonus stats to Mutants with at least 1 item.<br><tftstrong>Voracious Appetite</tftstrong> strengthens Mutants on each ally's death.<br><tftstrong>Voidborne</tftstrong> executes targets below a Health threshold and deals true damage. <br><tftstrong>Hyper-Adrenal Glands</tftstrong> give a chance for Mutants to deal additional attacks.<br><tftstrong>Synaptic Web</tftstrong> reduces the Mana cost of Mutants' Abilities.<br><tftstrong>Bio-Leeching</tftstrong> grants Omnivamp (healing for a percentage of damage dealt) to your team.<br><tftstrong>Metamorphosis</tftstrong> grants stacking bonuses to Mutants at regular intervals.",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"{02ce80f2}": 8,
					"{190fb0a2}": 18,
					"{2f805979}": 30,
					"{2fb1d11d}": 0.019999999552965164,
					"{3f1cec4d}": 20,
					"{5c51b509}": 1,
					"{66d8ecb1}": 50,
					"{6b5aee70}": 2,
					"{76882e8f}": 450,
					"{7c799240}": 20,
					"{82e43c84}": 20,
					"{994006f0}": 1,
					"{9cc303b4}": null,
					"{b6322d58}": 30,
					"{c26236e7}": 40,
					"{f3cab19f}": 175
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"{02ce80f2}": 12,
					"{190fb0a2}": 25,
					"{2f805979}": 55,
					"{2fb1d11d}": 0.029999999329447746,
					"{3f1cec4d}": 20,
					"{5c51b509}": 2,
					"{66d8ecb1}": 50,
					"{6b5aee70}": 2,
					"{76882e8f}": 900,
					"{7c799240}": 30,
					"{82e43c84}": 40,
					"{994006f0}": 2,
					"{9cc303b4}": 40,
					"{b6322d58}": 60,
					"{c26236e7}": 75,
					"{f3cab19f}": 225
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Experimental.dds",
		"name": "Mutant"
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Mercenary.dds",
		"name": "Mercenary"
	},
	{
		"apiName": "Set6_Glutton",
		"desc": "An ally can be fed to Tahm Kench once per planning phase, permanently granting him either Ability Power, Health, Armor, or Magic Resist.<br><br><tftitemrules>To feed, hold an ally over Tahm Kench until his mouth opens, then release.</tftitemrules>",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 1,
				"style": 3,
				"variables": {}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Glutton.dds",
		"name": "Glutton"
	},
	{
		"apiName": "Set6_Innovator",
		"desc": "Innovators build a mechanical companion to join the battle. The companion receives bonus Health and Attack Damage based on allied Innovators' star levels. <br><br><row>(@MinUnits@) Mechanical Scarab </row><br><row>(@MinUnits@) Mechanical Bear</row><br><row>(@MinUnits@) Mechanical Dragon </row>",
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Innovator.dds",
		"name": "Innovator"
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scholar.dds",
		"name": "Scholar"
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Twinshot.dds",
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Transformer.dds",
		"name": "Transformer"
	},
	{
		"apiName": "Set6_Bruiser",
		"desc": "Your team gains bonus maximum Health. Bruisers gain double the bonus.<br><expandRow>(@MinUnits@) @BonusHealth@ Health</expandRow>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusHealth": 125
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"BonusHealth": 225
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusHealth": 400
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusHealth": 700
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Bruiser.dds",
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Assassin.dds",
		"name": "Assassin"
	},
	{
		"apiName": "Set6_Colossus",
		"desc": "Innate: Colossi are bigger, more powerful, and immune to crowd control effects. However, each Colossus requires 2 team slots.<br><row>(@MinUnits@) Colossus champions take @DamageReduction*100@% less damage</row>",
		"effects": [
			{
				"maxUnits": 25000,
				"minUnits": 2,
				"style": 3,
				"variables": {
					"DamageReduction": 0.25,
					"{5c51b509}": 2
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Colossus.dds",
		"name": "Colossus"
	},
	{
		"apiName": "Set6_Arcanist",
		"desc": "Arcanists increase the Ability Power of your team.<br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power, Arcanists gain an additional @ArcanistAbilityPower@</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power, Arcanists gain an additional @ArcanistAbilityPower@</row><br><row>(@MinUnits@) Your team gains @TeamAbilityPower@ Ability Power</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"TeamAbilityPower": 20,
					"ArcanistAbilityPower": null
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"TeamAbilityPower": 20,
					"ArcanistAbilityPower": 40
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"TeamAbilityPower": 50,
					"ArcanistAbilityPower": 50
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"TeamAbilityPower": 145,
					"ArcanistAbilityPower": null
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Arcanist.dds",
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Sniper.dds",
		"name": "Sniper"
	},
	{
		"apiName": "Set6_Clockwork",
		"desc": "Your team has increased Attack Speed, with an additional increase per augment in the Hexcore.<br><br><expandRow>(@MinUnits@) @AttackSpeedBonus*100@% Attack Speed + @BonusPerAugment*100@% per augment </expandRow><br><br>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusPerAugment": 0.05000000074505806,
					"AttackSpeedBonus": 0.10000000149011612
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"BonusPerAugment": 0.10000000149011612,
					"AttackSpeedBonus": 0.3499999940395355
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"BonusPerAugment": 0.15000000596046448,
					"AttackSpeedBonus": 0.699999988079071
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Clockwork.dds",
		"name": "Clockwork"
	},
	{
		"apiName": "Set6_Enforcer",
		"desc": "Enforcers stun enemies at the start of combat. They break free after @DetainDuration@ seconds, or after losing @HPPercent*100@% of their maximum Health. Enforcers will not try to stun enemies who are immune to crowd control effects.<br><br><row>(@MinUnits@) The enemy who has the most Health</row><br><row>(@MinUnits@) And the enemy who dealt the most damage last combat</row>",
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
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enforcer.dds",
		"name": "Enforcer"
	},
	{
		"apiName": "Set6_Imperial",
		"desc": "At the start of combat, the Imperial who dealt the most damage last combat becomes the Tyrant. The Tyrant deals bonus damage. When the Tyrant dies, the Imperial who has dealt the most damage this combat becomes the new Tyrant.<br><br><row>(@MinUnits@) The Tyrant deals @TyrantTooltipBonusDamage@% bonus damage</row><br><row>(@MinUnits@) The Tyrant deals @TyrantTooltipBonusDamage@% bonus damage and the other Imperials deal @ImperialBonusDamage@% bonus damage</row>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 3,
				"variables": {
					"BonusDamage": 75,
					"ImperialBonusDamage": null,
					"TyrantTooltipBonusDamage": 75
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"BonusDamage": 100,
					"ImperialBonusDamage": 50,
					"TyrantTooltipBonusDamage": 150
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Imperial.dds",
		"name": "Imperial"
	},
	{
		"apiName": "Set6_Chemtech",
		"desc": "After dropping below @HealthThreshold@% Health, Chemtech champions become chem-powered, gaining Attack Speed, @DamageReduction@% damage reduction, and regenerating a percentage of their maximum Health each second for @Duration@ seconds.<br><br><expandRow>(@MinUnits@) @AttackSpeed@% Attack Speed, @HealthRegen@% Health</expandRow>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 1,
				"variables": {
					"AttackSpeed": 25,
					"DamageReduction": 25,
					"Duration": 8,
					"HealthRegen": 3,
					"HealthThreshold": 75
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 2,
				"variables": {
					"AttackSpeed": 50,
					"DamageReduction": 25,
					"Duration": 8,
					"HealthRegen": 4,
					"HealthThreshold": 75
				}
			},
			{
				"maxUnits": 8,
				"minUnits": 7,
				"style": 3,
				"variables": {
					"AttackSpeed": 80,
					"DamageReduction": 25,
					"Duration": 8,
					"HealthRegen": 7,
					"HealthThreshold": 75
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 9,
				"style": 4,
				"variables": {
					"AttackSpeed": 125,
					"DamageReduction": 25,
					"Duration": 8,
					"HealthRegen": 12,
					"HealthThreshold": 75
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Chemtech.dds",
		"name": "Chemtech"
	}
]