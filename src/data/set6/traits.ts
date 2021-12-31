import type { TraitData } from '#/game/types'

export enum TraitKey {
	bruiser = 'Bruiser', yordleLord = 'YordleLord', twinshot = 'Twinshot', mercenary = 'Mercenary', imperial = 'Imperial', chemtech = 'Chemtech', innovator = 'Innovator', sister = 'Sister', scholar = 'Scholar', socialite = 'Socialite', academy = 'Academy', mutant = 'Mutant', cuddly = 'Cuddly', protector = 'Protector', glutton = 'Glutton', enforcer = 'Enforcer', arcanist = 'Arcanist', clockwork = 'Clockwork', yordle = 'Yordle', assassin = 'Assassin', colossus = 'Colossus', transformer = 'Transformer', bodyguard = 'Bodyguard', scrap = 'Scrap', enchanter = 'Enchanter', sniper = 'Sniper', challenger = 'Challenger', syndicate = 'Syndicate'
}

export const traits: TraitData[] = [
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
		"apiName": "Set6_Twinshot",
		"desc": "Twinshots gain bonus Attack Damage. When a Twinshot attacks, they have a chance to attack twice instead.<br><br><expandRow>(@MinUnits@) @BonusAD@ Attack Damage, @ProcChance@% chance</expandRow><br>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"BonusAD": 5,
					"{b4a90a5d}": 40
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"BonusAD": 40,
					"{b4a90a5d}": 70
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"BonusAD": 80,
					"{b4a90a5d}": 100
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Twinshot.dds",
		"name": "Twinshot"
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
		"apiName": "Set6_Imperial",
		"desc": "At the start of combat, the Imperial who dealt the most damage last combat becomes the Tyrant. The Tyrant deals bonus damage. When the Tyrant dies, the Imperial who has dealt the most damage this combat becomes the new Tyrant.<br><br><row>(@MinUnits@) The Tyrant deals @TyrantTooltipBonusDamage@% bonus damage</row><br><row>(@MinUnits@) The Tyrant deals @TyrantTooltipBonusDamage@% bonus damage and the other Imperials deal @ImperialBonusDamage@% bonus damage</row>",
		"effects": [
			{
				"maxUnits": 4,
				"minUnits": 3,
				"style": 3,
				"variables": {
					"BonusDamage": 75,
					"{0acd95c2}": null,
					"{f469c9e6}": 75
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"BonusDamage": 50,
					"{0acd95c2}": 75,
					"{f469c9e6}": 125
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
					"AttackSpeed": 20,
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
					"{45564848}": 1,
					"{97ea7bfc}": 0.25
				}
			},
			{
				"maxUnits": 6,
				"minUnits": 5,
				"style": 3,
				"variables": {
					"{45564848}": 2,
					"{97ea7bfc}": 0.25
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 7,
				"style": 4,
				"variables": {
					"{45564848}": 3,
					"{97ea7bfc}": 0.25
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Innovator.dds",
		"name": "Innovator"
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
					"{2a50526a}": 3,
					"{3b173c39}": 4,
					"{5263ba40}": 0.4000000059604645
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Sisters.dds",
		"name": "Sister"
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
					"{471b1a16}": 2,
					"{d0539890}": 5
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"{471b1a16}": 2,
					"{d0539890}": 10
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"{471b1a16}": 2,
					"{d0539890}": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scholar.dds",
		"name": "Scholar"
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
					"{6c155e99}": null,
					"{f9f3a081}": null
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
					"{6c155e99}": null,
					"{f9f3a081}": 5
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
					"{6c155e99}": 0.30000001192092896,
					"{f9f3a081}": 5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Socialite.dds",
		"name": "Socialite"
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
					"{65722d9c}": 18,
					"{96ca059f}": 3
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"{65722d9c}": 40,
					"{96ca059f}": 5
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"{65722d9c}": 50,
					"{96ca059f}": 10
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"{65722d9c}": 70,
					"{96ca059f}": 15
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Academy.dds",
		"name": "Academy "
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
					"{b3105623}": 10,
					"{f9f3a081}": 5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Cuddly.TFT_Set6.dds",
		"name": "Cuddly"
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
					"Duration": 4,
					"ShieldPercent": 35
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"Duration": 4,
					"ShieldPercent": 45
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"Duration": 4,
					"ShieldPercent": 60
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_3_Protector.dds",
		"name": "Protector"
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
		"apiName": "Set6_Enforcer",
		"desc": "Enforcers stun enemies at the start of combat. They break free after @DetainDuration@ seconds, or after losing @HPPercent*100@% of their maximum Health. Enforcers will not try to stun enemies who are immune to crowd control effects.<br><br><row>(@MinUnits@) The enemy who has the most Health</row><br><row>(@MinUnits@) And the enemy who dealt the most damage last combat</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"HPPercent": 0.4000000059604645,
					"{70ed38c6}": 5,
					"{d2b7f6f1}": 1
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"HPPercent": 0.4000000059604645,
					"{70ed38c6}": 5,
					"{d2b7f6f1}": 2
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enforcer.dds",
		"name": "Enforcer"
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
					"{2f744e2b}": 20,
					"{faa12163}": null
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"{2f744e2b}": 20,
					"{faa12163}": 40
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"{2f744e2b}": 50,
					"{faa12163}": 50
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"{2f744e2b}": 145,
					"{faa12163}": null
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Arcanist.dds",
		"name": "Arcanist"
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
					"{51aec5d2}": 0.05000000074505806,
					"{cbb3a34f}": 0.10000000149011612
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"{51aec5d2}": 0.10000000149011612,
					"{cbb3a34f}": 0.3499999940395355
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"{51aec5d2}": 0.15000000596046448,
					"{cbb3a34f}": 0.699999988079071
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Clockwork.dds",
		"name": "Clockwork"
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
					"{ed1f9fc2}": null
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"{ed1f9fc2}": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Yordle.dds",
		"name": "Yordle"
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
					"{268f634e}": 20,
					"{9f2eb1e2}": 10
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"{268f634e}": 40,
					"{9f2eb1e2}": 30
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"{268f634e}": 60,
					"{9f2eb1e2}": 50
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
		"apiName": "Set6_Bodyguard",
		"desc": "Bodyguards have increased Armor. Shortly after combat begins, Bodyguards gain a Shield and taunt adjacent enemies, forcing them to attack the Bodyguard .<br><br><expandRow>(@MinUnits@) @BonusArmor@ Armor, @ShieldAmount@ Shield</expandRow>",
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
		"apiName": "Set6_Scrap",
		"desc": "At the start of combat, components held by Scrap champions turn into full items for the rest of combat. Also, your team gains a shield for each component equipped by your team, including those that are part of a full item.<br><br><row>(@MinUnits@) @NumComponents@ component, @HPShieldAmount@ shield</row><br><row>(@MinUnits@) @NumComponents@ components, @HPShieldAmount@ shield</row><br><row>(@MinUnits@) All components, @HPShieldAmount@ shield</row>",
		"effects": [
			{
				"maxUnits": 3,
				"minUnits": 2,
				"style": 1,
				"variables": {
					"{5cc08b27}": 1,
					"{94c6a08c}": 20
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"{5cc08b27}": 3,
					"{94c6a08c}": 35
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"{5cc08b27}": 10,
					"{94c6a08c}": 60
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Scrap.dds",
		"name": "Scrap"
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
					"{47343861}": 20,
					"{98396b21}": 0.25
				}
			},
			{
				"maxUnits": 3,
				"minUnits": 3,
				"style": 2,
				"variables": {
					"{47343861}": 35,
					"{98396b21}": 0.4000000059604645
				}
			},
			{
				"maxUnits": 4,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"{47343861}": 50,
					"{98396b21}": 0.6000000238418579
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 5,
				"style": 4,
				"variables": {
					"{47343861}": 75,
					"{98396b21}": 1
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Enchanter.dds",
		"name": "Enchanter"
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
					"{16394c87}": 1,
					"{75994f47}": 8
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 3,
				"variables": {
					"{16394c87}": 1,
					"{75994f47}": 16
				}
			},
			{
				"maxUnits": 25000,
				"minUnits": 6,
				"style": 4,
				"variables": {
					"{16394c87}": 1,
					"{75994f47}": 30
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Sniper.dds",
		"name": "Sniper"
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
					"{17cfa971}": 2.5
				}
			},
			{
				"maxUnits": 5,
				"minUnits": 4,
				"style": 2,
				"variables": {
					"BonusAS": 55,
					"{17cfa971}": 2.5
				}
			},
			{
				"maxUnits": 7,
				"minUnits": 6,
				"style": 3,
				"variables": {
					"BonusAS": 80,
					"{17cfa971}": 2.5
				}
			},
			{
				"maxUnits": 9999,
				"minUnits": 8,
				"style": 4,
				"variables": {
					"BonusAS": 130,
					"{17cfa971}": 2.5
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Challenger.dds",
		"name": "Challenger"
	},
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
					"{867bc055}": 0.33000001311302185,
					"{c9b0e3af}": 20
				}
			}
		],
		"icon": "ASSETS/UX/TraitIcons/Trait_Icon_6_Syndicate.dds",
		"name": "Syndicate"
	}
]