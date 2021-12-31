import type { ChampionData } from '#/game/types'

export const champions: ChampionData[] = [
	{
		"ability": {
			"desc": "Graves launches a smoke grenade toward his current target. The grenade explodes on impact dealing @ModifiedDamage@ magic damage to nearby enemies, and disarms enemies who remain within the smoke cloud for @DisarmDuration@ seconds.",
			"icon": "ASSETS/Characters/Graves/HUD/Icons2D/GravesSmokeGrenade.dds",
			"name": "Smoke Grenade",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						150,
						250,
						400,
						0,
						0,
						0
					]
				},
				{
					"name": "DisarmDuration",
					"value": [
						1.5,
						2,
						2.5,
						3,
						3.5,
						4,
						4.5
					]
				}
			]
		},
		"apiName": "TFT6_Graves",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Graves.TFT_Set6.dds",
		"name": "Graves",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 750,
			"initialMana": 80,
			"magicResist": 40,
			"mana": 120,
			"range": 1
		},
		"traits": [
			"Academy ",
			"Twinshot"
		]
	},
	{
		"ability": {
			"desc": "Katarina blinks behind the enemy with the lowest Health within 3 hexes and slashes all adjacent enemies, dealing @ModifiedDamage@ magic damage. Katarina gains @ManaRefund@ Mana for each enemy killed by Shunpo.",
			"icon": "ASSETS/Characters/Katarina/HUD/Icons2D/Katarina_E.dds",
			"name": "Shunpo",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						160,
						200,
						250,
						0,
						0,
						0
					]
				},
				{
					"name": "ManaRefund",
					"value": [
						20,
						20,
						20,
						20,
						20,
						20,
						20
					]
				}
			]
		},
		"apiName": "TFT6_Katarina",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Katarina.TFT_Set6.dds",
		"name": "Katarina",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 650,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 40,
			"range": 1
		},
		"traits": [
			"Academy ",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Leona calls down a beacon of light upon herself, granting herself a @ModifiedShielding@ Health shield for @Duration@ seconds. Leona and allies within 2 hexes gain @BonusStats@ Armor and Magic Resistance for the same duration.",
			"icon": "ASSETS/Characters/Leona/HUD/Icons2D/LeonaSolarFlare.dds",
			"name": "Solar Eclipse",
			"variables": [
				{
					"name": "Shielding",
					"value": [
						0,
						400,
						650,
						1000,
						160,
						200,
						240
					]
				},
				{
					"name": "Duration",
					"value": [
						4,
						5,
						5,
						8,
						4,
						4,
						4
					]
				},
				{
					"name": "BonusStats",
					"value": [
						25,
						30,
						50,
						80,
						25,
						25,
						25
					]
				}
			]
		},
		"apiName": "TFT6_Leona",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Leona.TFT_Set6.dds",
		"name": "Leona",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 850,
			"initialMana": 75,
			"magicResist": 50,
			"mana": 125,
			"range": 1
		},
		"traits": [
			"Academy ",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "After gathering energy, Lux fires a beam towards the farthest enemy target, dealing @ModifiedDamage@ magic damage. If she kills a unit with her beam, she gains @ManaRefund@ mana. ",
			"icon": "ASSETS/Characters/Lux/HUD/Icons2D/LuxFinaleFunkeln.dds",
			"name": "Final Spark",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						225,
						375,
						900,
						1400,
						1700,
						2000
					]
				},
				{
					"name": "ManaRefund",
					"value": [
						20,
						20,
						20,
						20,
						20,
						20,
						20
					]
				}
			]
		},
		"apiName": "TFT6_Lux",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Lux.TFT_Set6.dds",
		"name": "Lux",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 45,
			"hp": 750,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Academy ",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Yone summons his spirit to attack an enemy up to @HexRange@ hexes away for @Duration@ seconds. The spirit is an untargetable, invulnerable copy of Yone and heals him for @ModifiedLifesteal@ of the damage it deals.<br><br>If Yone dies, his spirit dies with him.",
			"icon": "ASSETS/Characters/Yone/HUD/Icons2D/YoneE.Yone.dds",
			"name": "Soul Unbound",
			"variables": [
				{
					"name": "Duration",
					"value": [
						4,
						4,
						5,
						20,
						4,
						4,
						4
					]
				},
				{
					"name": "Lifesteal",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.5,
						1,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				},
				{
					"name": "HexRange",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				}
			]
		},
		"apiName": "TFT6_Yone",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Yone.TFT_Set6.dds",
		"name": "Yone",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.8500000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 950,
			"initialMana": 50,
			"magicResist": 40,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Academy ",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Yuumi and Book detach and then launch @NumOfWaves@ waves toward the farthest enemy, each dealing @ModifiedDamage@ magic damage and stunning enemies for @StunDuration@ seconds. She then attaches to the lowest Health ally.",
			"icon": "ASSETS/Characters/Yuumi/HUD/Icons2D/YuumiR.dds",
			"name": "Final Chapter",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						45,
						80,
						247,
						0,
						0,
						0
					]
				},
				{
					"name": "NumOfWaves",
					"value": [
						0,
						3,
						5,
						33,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						0,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75
					]
				},
				{
					"name": "TimeBetweenWaves",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.10000000149011612,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				}
			]
		},
		"apiName": "TFT6_Yuumi",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Yuumi.TFT_Set6.dds",
		"name": "Yuumi",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 800,
			"initialMana": 80,
			"magicResist": 30,
			"mana": 200,
			"range": 4
		},
		"traits": [
			"Cuddly",
			"Academy ",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Singed flings a nearby enemy towards the largest cluster of enemies, stunning his target for @StunDuration@ seconds when they land. All adjacent enemies take @ModifiedDamage@ magic damage and are briefly stunned.",
			"icon": "ASSETS/Characters/Singed/HUD/Icons2D/Singed_E.dds",
			"name": "Fling",
			"variables": [
				{
					"name": "AoEStunDuration",
					"value": [
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75
					]
				},
				{
					"name": "Damage",
					"value": [
						50,
						125,
						175,
						250,
						800,
						1600,
						3200
					]
				},
				{
					"name": "StunDuration",
					"value": [
						2,
						1.5,
						2,
						3,
						4,
						4,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Singed",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Singed.TFT_Set6.dds",
		"name": "Singed",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 100,
			"magicResist": 40,
			"mana": 150,
			"range": 1
		},
		"traits": [
			"Chemtech",
			"Innovator"
		]
	},
	{
		"ability": {
			"desc": "Twitch fires a powerful bolt towards his target that pierces through enemies, deals @PercentAttackDamage*100@% of his Attack Damage plus @ModifiedDamage@ bonus physical damage (total: <scaleAD>@TotalDamage@ %i:scaleAD%</scaleAD>) and reduces healing by @GWStrength*100@% for @GWDuration@ seconds.",
			"icon": "ASSETS/Characters/Twitch/HUD/Icons2D/Twitch_R.dds",
			"name": "Piercing Bolt",
			"variables": [
				{
					"name": "PercentAttackDamage",
					"value": [
						0,
						1.25,
						1.350000023841858,
						1.5,
						0,
						0,
						0
					]
				},
				{
					"name": "GWStrength",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "GWDuration",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				},
				{
					"name": "BaseDamage",
					"value": [
						0.5,
						25,
						50,
						75,
						0.5,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Twitch",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Twitch.TFT_Set6.dds",
		"name": "Twitch",
		"stats": {
			"armor": 15,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 450,
			"initialMana": 0,
			"magicResist": 15,
			"mana": 35,
			"range": 3
		},
		"traits": [
			"Chemtech",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Lissandra encases her target in an iron maiden, stunning them for @StunDuration@ seconds and dealing @ModifiedDamage@ magic damage to enemies within a large area. Damage from the iron maiden reduces enemies' Attack Damage by @WeakenedPercent*100@% for @WeakenedDuration@ seconds.<br><br>If Lissandra is below @HealthThreshold*100@% Health, she encases herself instead, dealing damage to surrounding enemies and becoming untargetable and invulnerable for @UntargetableDuration@ seconds.",
			"icon": "ASSETS/Characters/Lissandra/HUD/Icons2D/Lissandra_R.dds",
			"name": "Iron Maiden",
			"variables": [
				{
					"name": "StunDuration",
					"value": [
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						225,
						300,
						500,
						0,
						0,
						0
					]
				},
				{
					"name": "HealthThreshold",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "UntargetableDuration",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				},
				{
					"name": "WeakenedPercent",
					"value": [
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896
					]
				},
				{
					"name": "WeakenedDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Lissandra",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Lissandra.TFT_Set6.dds",
		"name": "Lissandra",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 750,
			"initialMana": 70,
			"magicResist": 30,
			"mana": 120,
			"range": 2
		},
		"traits": [
			"Chemtech",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Passive: Warwick's Attacks deal an additional @ModifiedPercentHealth@ of his target's current Health as bonus magic damage, and heal him for @ModifiedHealAmount@ health.",
			"icon": "ASSETS/Characters/Warwick/HUD/Icons2D/WarwickP.dds",
			"name": "Eternal Hunger",
			"variables": [
				{
					"name": "PercentHealth",
					"value": [
						0.05000000074505806,
						0.07000000029802322,
						0.09000000357627869,
						0.11999999731779099,
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806
					]
				},
				{
					"name": "HealAmount",
					"value": [
						0,
						35,
						50,
						75,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Warwick",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Warwick.TFT_Set6.dds",
		"name": "Warwick",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 750,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 0,
			"range": 1
		},
		"traits": [
			"Chemtech",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Zac stretches his arms up to 3 hexes to pull the 2 most distant enemies towards him, dealing @ModifiedDamage@ magic damage.",
			"icon": "ASSETS/Characters/Zac/HUD/Icons2D/ZacQ.dds",
			"name": "Yoink!",
			"variables": [
				{
					"name": "Damage",
					"value": [
						50,
						400,
						525,
						999,
						450,
						550,
						650
					]
				},
				{
					"name": "HexPull",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				}
			]
		},
		"apiName": "TFT6_Zac",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Zac.TFT_Set6.dds",
		"name": "Zac",
		"stats": {
			"armor": 45,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 800,
			"initialMana": 60,
			"magicResist": 45,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Chemtech",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Dr. Mundo injects himself with “medicine”, restoring @PercentHealthInstantHeal*100@% of his maximum Health and becoming energized for @Duration@ seconds. While energized, he restores an additional @PercentHealthHealing*100@% of his maximum Health over the duration and deals @ModifiedDamage@ magic damage to a random nearby enemy each second. When the \"medicine\" expires, Dr. Mundo expels a burst of electricity that deals @ModifiedPercentHealthDamage@ of his current Health as magic damage to all enemies within 2 hexes.",
			"icon": "ASSETS/Characters/DrMundo/HUD/Icons2D/DrMundo_R.Dr_Mundo_VGU.dds",
			"name": "Zap Dose",
			"variables": [
				{
					"name": "Duration",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				},
				{
					"name": "PercentHealthHealing",
					"value": [
						0.30000001192092896,
						0.25,
						0.3499999940395355,
						1,
						1.5,
						1.7999999523162842,
						2.0999999046325684
					]
				},
				{
					"name": "Damage",
					"value": [
						10,
						80,
						125,
						300,
						100,
						110,
						130
					]
				},
				{
					"name": "PercentHealthDamage",
					"value": [
						0.05000000074505806,
						0.15000000596046448,
						0.20000000298023224,
						0.5,
						0.25,
						0.30000001192092896,
						0.3499999940395355
					]
				},
				{
					"name": "HealingTickRate",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "DamageTickRate",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "PercentHealthInstantHeal",
					"value": [
						0.3499999940395355,
						0.3499999940395355,
						0.3499999940395355,
						0.3499999940395355,
						0.3499999940395355,
						0.3499999940395355,
						0.3499999940395355
					]
				}
			]
		},
		"apiName": "TFT6_DrMundo",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_DrMundo.TFT_Set6.dds",
		"name": "Dr. Mundo",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 1000,
			"initialMana": 75,
			"magicResist": 50,
			"mana": 150,
			"range": 1
		},
		"traits": [
			"Chemtech",
			"Mutant",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Passive: Viktor's attacks melt his target's defenses, reducing their Armor by @ArmorReduction*100@% for @ShredDuration@ seconds.<br><br>Viktor summons multiple singularities that fire death rays, which cut across the battlefield in a line. To enemies caught in its path, death rays deal @ModifiedDamage@ magic damage, destroy @ShieldDestructionPercent*100@% of any remaining shields.",
			"icon": "ASSETS/Characters/Viktor/HUD/Icons2D/Viktor_E2.dds",
			"name": "Chaos Rays",
			"variables": [
				{
					"name": "DamageAmount",
					"value": [
						50,
						325,
						425,
						1500,
						50,
						50,
						50
					]
				},
				{
					"name": "NumLasers",
					"value": [
						3,
						3,
						4,
						12,
						3,
						3,
						3
					]
				},
				{
					"name": "ShredDuration",
					"value": [
						6,
						6,
						6,
						6,
						6,
						6,
						6
					]
				},
				{
					"name": "ArmorReduction",
					"value": [
						0.5,
						0.699999988079071,
						0.699999988079071,
						0.699999988079071,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "ShieldDestructionPercent",
					"value": [
						0,
						0.25,
						0.33000001311302185,
						1,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Viktor",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Viktor.TFT_Set6.dds",
		"name": "Viktor",
		"stats": {
			"armor": 35,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 850,
			"initialMana": 0,
			"magicResist": 35,
			"mana": 150,
			"range": 4
		},
		"traits": [
			"Chemtech",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Camille gains a shield blocking @ModifiedShield@ damage over @ShieldDuration@ seconds, then sweeps her leg, dealing @ModifiedDamage@ magic damage to enemies in a cone. While this shield holds, Camille's attacks restore @ModifiedHealing@ Health.",
			"icon": "ASSETS/Characters/Camille/HUD/Icons2D/Camille_W.dds",
			"name": "Defensive Sweep",
			"variables": [
				{
					"name": "ShieldDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "Damage",
					"value": [
						25,
						150,
						200,
						300,
						325,
						400,
						475
					]
				},
				{
					"name": "Shield",
					"value": [
						100,
						225,
						300,
						435,
						300,
						350,
						400
					]
				},
				{
					"name": "HealingPerAttack",
					"value": [
						10,
						30,
						50,
						80,
						90,
						110,
						130
					]
				}
			]
		},
		"apiName": "TFT6_Camille",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Camille.TFT_Set6.dds",
		"name": "Camille",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 700,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 60,
			"range": 1
		},
		"traits": [
			"Clockwork",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Zilean places a bomb on the closest enemy, stunning them for @StunDuration@ seconds. When the stun ends or the target dies, the bomb explodes, dealing @ModifiedDamage@ magic damage to adjacent enemies and reducing their Attack Speed by @Slow*100@% for @SlowDuration@ seconds. ",
			"icon": "ASSETS/Characters/Zilean/HUD/Icons2D/Zilean_Q.dds",
			"name": "Time Bomb",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						250,
						350,
						700,
						0,
						0,
						0
					]
				},
				{
					"name": "Slow",
					"value": [
						0,
						0.25,
						0.3499999940395355,
						0.5,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						0,
						1.5,
						2,
						2.5,
						0,
						0,
						0
					]
				},
				{
					"name": "SlowDuration",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				}
			]
		},
		"apiName": "TFT6_Zilean",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Zilean.TFT_Set6.dds",
		"name": "Zilean",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 600,
			"initialMana": 40,
			"magicResist": 20,
			"mana": 80,
			"range": 4
		},
		"traits": [
			"Clockwork",
			"Innovator"
		]
	},
	{
		"ability": {
			"desc": "Orianna sends her ball towards the largest group of champions, then commands it to release a shockwave. Allies within 2 hexes gain @ModifiedShieldAmount@ shield for @Duration@ seconds, while enemies within the area are briefly knocked up and dealt @ModifiedDamage@ magic damage. Enemies adjacent to the ball are drawn in and stunned for @StunDuration@ seconds.",
			"icon": "ASSETS/Characters/Orianna/HUD/Icons2D/OriannaCommandDetonate.dds",
			"name": "Command: Shockwave",
			"variables": [
				{
					"name": "ShieldAmount",
					"value": [
						0,
						100,
						160,
						400,
						0,
						0,
						0
					]
				},
				{
					"name": "Duration",
					"value": [
						0,
						4,
						4,
						4,
						0,
						0,
						0
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						350,
						550,
						1200,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						2,
						1,
						1,
						4,
						2,
						2,
						2
					]
				}
			]
		},
		"apiName": "TFT6_Orianna",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Orianna.TFT_Set6.dds",
		"name": "Orianna",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 750,
			"initialMana": 50,
			"magicResist": 30,
			"mana": 140,
			"range": 4
		},
		"traits": [
			"Clockwork",
			"Enchanter"
		]
	},
	{
		"ability": {
			"desc": "Jhin transforms his weapon into a powerful sniper rifle for his next 4 shots. Each shot deals @PercentAttackDamage*100@% of his Attack Damage as physical damage, reduced by @DamageFalloff*100@% for each target it pierces through. (total: @TotalDamage@) The 4th shot is guaranteed to critically strike, and deals @ModifiedBonusDamage@ more damage based on his target's missing Health.<br><br>Passive: Jhin always attacks @AttackSpeed@ times per second. He converts each 1% of bonus Attack Speed into @ADFromAttackSpeed@ Attack Damage.",
			"icon": "ASSETS/Characters/Jhin/HUD/Icons2D/Jhin_R.dds",
			"name": "Curtain Call",
			"variables": [
				{
					"name": "BonusDamage",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "PercentAttackDamage",
					"value": [
						1.2000000476837158,
						1.5,
						2,
						3.440000057220459,
						1.2000000476837158,
						1.2000000476837158,
						1.2000000476837158
					]
				},
				{
					"name": "DamageFalloff",
					"value": [
						0.33000001311302185,
						0.33000001311302185,
						0.33000001311302185,
						0.33000001311302185,
						0.33000001311302185,
						0.33000001311302185,
						0.33000001311302185
					]
				},
				{
					"name": "AttackSpeed",
					"value": [
						0.8500000238418579,
						0.8999999761581421,
						0.8999999761581421,
						1.399999976158142,
						0.8500000238418579,
						0.8500000238418579,
						0.8500000238418579
					]
				},
				{
					"name": "ADFromAttackSpeed",
					"value": [
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929
					]
				}
			]
		},
		"apiName": "TFT6_Jhin",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Jhin.TFT_Set6.dds",
		"name": "Jhin",
		"stats": {
			"armor": 30,
			"attackSpeed": 2,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 700,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 70,
			"range": 4
		},
		"traits": [
			"Clockwork",
			"Sniper"
		]
	},
	{
		"ability": {
			"desc": "Miss Fortune rains 4 waves of bullets down around her target, dealing @ModifiedMagicDamage@ total magic damage to enemies in the area and reducing their incoming healing by @HealingReduction@% for @HealingReductionDuration@ seconds.",
			"icon": "ASSETS/Characters/MissFortune/HUD/Icons2D/MissFortune_E.dds",
			"name": "Make it Rain",
			"variables": [
				{
					"name": "MagicDamage",
					"value": [
						0,
						275,
						375,
						550,
						0,
						0,
						0
					]
				},
				{
					"name": "HealingReduction",
					"value": [
						0,
						50,
						50,
						50,
						50,
						50,
						50
					]
				},
				{
					"name": "HealingReductionDuration",
					"value": [
						0,
						6,
						6,
						6,
						6,
						6,
						6
					]
				}
			]
		},
		"apiName": "TFT6_MissFortune",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_MissFortune.TFT_Set6.dds",
		"name": "Miss Fortune",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 40,
			"magicResist": 25,
			"mana": 80,
			"range": 3
		},
		"traits": [
			"Mercenary",
			"Sniper"
		]
	},
	{
		"ability": {
			"desc": "Illaoi slams her target, linking her soul to it for @Duration@ seconds and dealing @ModifiedDamage@ magic damage. While linked, Illaoi is healed for @PercentHealing*100@% of the damage taken by her target.",
			"icon": "ASSETS/Characters/Illaoi/HUD/Icons2D/Illaoi_W.dds",
			"name": "Harsh Lesson",
			"variables": [
				{
					"name": "MagicDamage",
					"value": [
						0,
						175,
						300,
						500,
						0,
						0,
						0
					]
				},
				{
					"name": "PercentHealing",
					"value": [
						0,
						0.25,
						0.30000001192092896,
						0.3499999940395355,
						0,
						0,
						0
					]
				},
				{
					"name": "Duration",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				}
			]
		},
		"apiName": "TFT6_Illaoi",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Illaoi.TFT_Set6.dds",
		"name": "Illaoi",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 700,
			"initialMana": 40,
			"magicResist": 40,
			"mana": 80,
			"range": 1
		},
		"traits": [
			"Mercenary",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Twisted Fate throws 3 cards in a cone that deal @ModifiedDamage@ magic damage to each enemy they pass through.",
			"icon": "ASSETS/Characters/TwistedFate/HUD/Icons2D/Cardmaster_PowerCard.dds",
			"name": "Wild Cards",
			"variables": [
				{
					"name": "BaseDamage",
					"value": [
						0,
						140,
						190,
						255,
						700,
						700,
						700
					]
				}
			]
		},
		"apiName": "TFT6_TwistedFate",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_TwistedFate.TFT_Set6.dds",
		"name": "Twisted Fate",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 20,
			"mana": 40,
			"range": 3
		},
		"traits": [
			"Syndicate",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Gangplank attacks his target with his gun, dealing @ADPercent*100@% of his Attack Damage plus @ModifiedDamage@ bonus physical damage (total: <scaleAD>@TotalDamage@ %i:scaleAD%</scaleAD>). If this attack kills a champion, Gangplank plunders 1 gold. ",
			"icon": "ASSETS/Characters/Gangplank/HUD/Icons2D/Gangplank_Q.dds",
			"name": "Parrrley",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						110,
						135,
						170,
						0,
						0,
						0
					]
				},
				{
					"name": "ADPercent",
					"value": [
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158
					]
				}
			]
		},
		"apiName": "TFT6_Gangplank",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Gangplank.TFT_Set6.dds",
		"name": "Gangplank",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 75,
			"hp": 750,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 50,
			"range": 1
		},
		"traits": [
			"Mercenary",
			"Twinshot"
		]
	},
	{
		"ability": {
			"desc": "Tahm Kench devours his target, storing them in his belly and dealing @ModifiedDamage@ magic damage over @BellyDuration@ seconds. During this time, they are invulnerable to other sources of damage and Tahm Kench takes @DamageReduction*100@% less damage.<br><br>If they die while inside, Tahm Kench either spits out a random component they were holding, or the cost of the unit in gold. Otherwise, he spits them towards the farthest enemy, briefly stunning targets on impact.<br><br>If a target is immune to crowd control, Tahm Kench will instead deal @ReducedModifiedDamage@ magic damage.",
			"icon": "ASSETS/Characters/TahmKench/HUD/Icons2D/TahmKenchRWrapper.dds",
			"name": "Devour",
			"variables": [
				{
					"name": "Damage",
					"value": [
						600,
						900,
						1450,
						30000,
						9999,
						1300,
						1550
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "BellyDuration",
					"value": [
						0,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "DamageReduction",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				},
				{
					"name": "TickRate",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "ReducedDamageToCC",
					"value": [
						0,
						325,
						550,
						10500,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_TahmKench",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_TahmKench.TFT_Set6.dds",
		"name": "Tahm Kench",
		"stats": {
			"armor": 60,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 1000,
			"initialMana": 30,
			"magicResist": 60,
			"mana": 60,
			"range": 1
		},
		"traits": [
			"Mercenary",
			"Bruiser",
			"Glutton"
		]
	},
	{
		"ability": {
			"desc": "Seraphine projects her song towards the largest group of units dealing @ModifiedDamage@ magic damage to enemies. Allies it passes through are healed for @ModifiedHeal@ Health and gain @ASBonus*100@% Attack Speed for @ASBonusDuration@ seconds.",
			"icon": "ASSETS/Characters/Seraphine/HUD/Icons2D/Seraphine_R.EllipsisMage.dds",
			"name": "Encore",
			"variables": [
				{
					"name": "Damage",
					"value": [
						1,
						250,
						400,
						1000,
						2,
						2.25,
						2.5
					]
				},
				{
					"name": "Heal",
					"value": [
						0,
						250,
						400,
						1000,
						0,
						0,
						0
					]
				},
				{
					"name": "ASBonus",
					"value": [
						0.30000001192092896,
						0.30000001192092896,
						0.5,
						1,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896
					]
				},
				{
					"name": "ASBonusDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Seraphine",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Seraphine.TFT_Set6.dds",
		"name": "Seraphine",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 750,
			"initialMana": 80,
			"magicResist": 30,
			"mana": 160,
			"range": 4
		},
		"traits": [
			"Socialite",
			"Innovator"
		]
	},
	{
		"ability": {
			"desc": "Zyra summons vines in the row with the most enemies, dealing @ModifiedDamage@ magic damage and stunning them for @StunDuration@ seconds.",
			"icon": "ASSETS/Characters/Zyra/HUD/Icons2D/ZyraQ.dds",
			"name": "Grasping Spines",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						350,
						450,
						650,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1,
						1.5,
						2,
						2.5,
						3,
						3.5,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Zyra",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Zyra.TFT_Set6.dds",
		"name": "Zyra",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 600,
			"initialMana": 60,
			"magicResist": 20,
			"mana": 120,
			"range": 4
		},
		"traits": [
			"Syndicate",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Darius swings his axe in a circle, dealing @ModifiedDamage@ magic damage, then heals himself @ModifiedHeal@ Health for each enemy hit.",
			"icon": "ASSETS/Characters/Darius/HUD/Icons2D/Darius_Icon_Decimate.dds",
			"name": "Decimate",
			"variables": [
				{
					"name": "Damage",
					"value": [
						125,
						200,
						275,
						350,
						425,
						500,
						575
					]
				},
				{
					"name": "Heal",
					"value": [
						100,
						120,
						140,
						160,
						180,
						200,
						220
					]
				},
				{
					"name": "HexRange",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				}
			]
		},
		"apiName": "TFT6_Darius",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Darius.TFT_Set6.dds",
		"name": "Darius",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.5,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 70,
			"magicResist": 40,
			"mana": 120,
			"range": 1
		},
		"traits": [
			"Syndicate",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Swain unleashes piercing bolts of eldritch power in a cone towards his target, dealing @ModifiedDamage@ magic damage to enemies within and healing Swain for @ModifiedHealing@ for each enemy hit.",
			"icon": "ASSETS/Characters/Swain/HUD/Icons2D/Swain_Q.dds",
			"name": "Death's Hand",
			"variables": [
				{
					"name": "BaseDamage",
					"value": [
						0,
						250,
						375,
						525,
						0,
						0,
						0
					]
				},
				{
					"name": "Range",
					"value": [
						660,
						660,
						660,
						660,
						660,
						660,
						660
					]
				},
				{
					"name": "Healing",
					"value": [
						80,
						200,
						230,
						300,
						80,
						80,
						80
					]
				}
			]
		},
		"apiName": "TFT6_Swain",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Swain.TFT_Set6.dds",
		"name": "Swain",
		"stats": {
			"armor": 45,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 45,
			"hp": 800,
			"initialMana": 40,
			"magicResist": 45,
			"mana": 80,
			"range": 2
		},
		"traits": [
			"Imperial",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "If a target is adjacent to Samira, she slashes with her blade in a cone towards them dealing @ADPercent*100@% of her Attack Damage as physical damage to all enemies within and reducing their Armor by @ModifiedArmorShred@. (total: @TooltipDamage@) This Armor reduction can stack.<br><br>Otherwise, she fires an empowered shot at her target with the same effects and gains @ManaRefund@ Mana.",
			"icon": "ASSETS/Characters/Samira/HUD/Icons2D/SamiraQ.Samira.dds",
			"name": "Flair",
			"variables": [
				{
					"name": "ADPercent",
					"value": [
						1.5,
						1.75,
						1.7999999523162842,
						1.899999976158142,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "ManaRefund",
					"value": [
						20,
						20,
						20,
						20,
						20,
						20,
						20
					]
				},
				{
					"name": "ArmorShred",
					"value": [
						0,
						10,
						15,
						20,
						20,
						25,
						30
					]
				}
			]
		},
		"apiName": "TFT6_Samira",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Samira.TFT_Set6.dds",
		"name": "Samira",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 75,
			"hp": 650,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 35,
			"range": 3
		},
		"traits": [
			"Imperial",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Vi empowers her next attack to blast through her target, dealing @ModifiedDamage@ magic damage to all enemies in a cone and reducing their Armor by @ArmorReduction*100@% for @Duration@ seconds.",
			"icon": "ASSETS/Characters/TFT6_Vi/HUD/Icons2D/TFT6_ViE.TFT_Set6.dds",
			"name": "Denting Blow",
			"variables": [
				{
					"name": "Damage",
					"value": [
						50,
						250,
						375,
						600,
						650,
						800,
						950
					]
				},
				{
					"name": "Duration",
					"value": [
						8,
						8,
						8,
						8,
						8,
						8,
						8
					]
				},
				{
					"name": "ArmorReduction",
					"value": [
						0.25,
						0.4000000059604645,
						0.5,
						0.699999988079071,
						1.25,
						1.5,
						1.75
					]
				}
			]
		},
		"apiName": "TFT6_Vi",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Vi.TFT_Set6.dds",
		"name": "Vi",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 700,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 50,
			"range": 1
		},
		"traits": [
			"Enforcer",
			"Sister",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Caitlyn takes aim at the farthest enemy, firing a deadly bullet towards them that deals @ModifiedDamage@ magic damage to the first enemy it hits.",
			"icon": "ASSETS/Characters/Caitlyn/HUD/Icons2D/Caitlyn_AceintheHole.dds",
			"name": "Ace in the Hole",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						800,
						1400,
						2250,
						2400,
						3000,
						3600
					]
				}
			]
		},
		"apiName": "TFT6_Caitlyn",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Caitlyn.TFT_Set6.dds",
		"name": "Caitlyn",
		"stats": {
			"armor": 15,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 15,
			"mana": 110,
			"range": 4
		},
		"traits": [
			"Enforcer",
			"Sniper"
		]
	},
	{
		"ability": {
			"desc": "Melee form: Jayce slams his hammer down onto nearby enemies, dealing damage and reducing their Armor and Magic Resist.<br>Ranged form: Jayce deploys an acceleration gate, granting bonus Attack Speed to allies in the same row, then fires an orb of electricity at the largest enemy group.",
			"icon": "ASSETS/Characters/Jayce/HUD/Icons2D/Jayce_R1.dds",
			"name": "Mercury Cannon/Mercury Hammer",
			"variables": []
		},
		"apiName": "TFT6_Jayce",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Jayce.TFT_Set6.dds",
		"name": "Jayce",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 1000,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 60,
			"range": 1
		},
		"traits": [
			"Enforcer",
			"Innovator",
			"Transformer"
		]
	},
	{
		"ability": {
			"desc": "Malzahar infects the mind of the closest unafflicted target, dealing @ModifiedDamage@ magic damage over @Duration@ seconds and reducing the Magic Resist of enemies by @MRShred*100@%.<br><br>If an afflicted target dies, Malefic Visions spreads to the nearest @SpreadTargets@ unafflicted targets with the remaining duration.",
			"icon": "ASSETS/Characters/Malzahar/HUD/Icons2D/Malzahar_E.dds",
			"name": "Malefic Visions",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						700,
						850,
						1000,
						0,
						0,
						0
					]
				},
				{
					"name": "Duration",
					"value": [
						0,
						8,
						8,
						8,
						8,
						8,
						8
					]
				},
				{
					"name": "MRShred",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				},
				{
					"name": "SpreadTargets",
					"value": [
						0,
						1,
						1,
						2,
						4,
						5,
						6
					]
				},
				{
					"name": "TickRate",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				}
			]
		},
		"apiName": "TFT6_Malzahar",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Malzahar.TFT_Set6.dds",
		"name": "Malzahar",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 650,
			"initialMana": 30,
			"magicResist": 30,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Mutant",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "For @Duration@ seconds, Kog'Maw gains infinite Attack Range, @PercentAttackSpeed*100@% Attack Speed, and his attacks deal @ModifiedPercentMaxHPDamage@ of the target's maximum Health as bonus magic damage.",
			"icon": "ASSETS/Characters/KogMaw/HUD/Icons2D/KogMaw_BioArcaneBarrage.dds",
			"name": "Barrage",
			"variables": [
				{
					"name": "Duration",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "PercentAttackSpeed",
					"value": [
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75
					]
				},
				{
					"name": "PercentMaxHPDamage",
					"value": [
						0,
						0.07000000029802322,
						0.07999999821186066,
						0.09000000357627869,
						0.07999999821186066,
						0.07999999821186066,
						0.07999999821186066
					]
				}
			]
		},
		"apiName": "TFT6_KogMaw",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_KogMaw.TFT_Set6.dds",
		"name": "Kog'Maw",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 35,
			"hp": 550,
			"initialMana": 0,
			"magicResist": 20,
			"mana": 30,
			"range": 3
		},
		"traits": [
			"Mutant",
			"Sniper",
			"Twinshot"
		]
	},
	{
		"ability": {
			"desc": "Cho'Gath devours the lowest Health enemy within range, dealing @ModifiedDamage@ magic damage. If this kills the target, Cho'Gath gains a stack of Feast (increased to two in Hyper Roll), up to @MaxFeastStacks@. Each stack of Feast permanently grants @BonusHealthOnKill*100@% bonus Health and size. ",
			"icon": "ASSETS/Characters/Chogath/HUD/Icons2D/GreenTerror_Feast.dds",
			"name": "Feast",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						800,
						900,
						1000,
						3200,
						6400,
						12800
					]
				},
				{
					"name": "BonusHealthOnKill",
					"value": [
						0.019999999552965164,
						0.019999999552965164,
						0.019999999552965164,
						0.019999999552965164,
						0.019999999552965164,
						0.019999999552965164,
						0.019999999552965164
					]
				},
				{
					"name": "MaxFeastStacks",
					"value": [
						0,
						20,
						40,
						999,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_ChoGath",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_ChoGath.TFT_Set6.dds",
		"name": "Cho'Gath",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 1300,
			"initialMana": 100,
			"magicResist": 50,
			"mana": 165,
			"range": 1
		},
		"traits": [
			"Mutant",
			"Bruiser",
			"Colossus"
		]
	},
	{
		"ability": {
			"desc": "Sion winds up for a moment, then smashes his axe down. All enemies within a large area are knocked up, stunned for @KnockUpDuration@ seconds, and dealt @ModifiedDamage@ magic damage.",
			"icon": "ASSETS/Characters/Sion/HUD/Icons2D/Sion_R2.dds",
			"name": "Decimating Smash",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						100,
						200,
						500,
						2000,
						2000,
						1200
					]
				},
				{
					"name": "ChargeUpTime",
					"value": [
						1.25,
						1.25,
						1.25,
						1.25,
						1.25,
						1.25,
						1.25
					]
				},
				{
					"name": "KnockUpDuration",
					"value": [
						1.5,
						2,
						3,
						6,
						1.5,
						1.5,
						1.5
					]
				}
			]
		},
		"apiName": "TFT6_Sion",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Sion.TFT_Set6.dds",
		"name": "Sion",
		"stats": {
			"armor": 60,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 100,
			"hp": 1850,
			"initialMana": 100,
			"magicResist": 60,
			"mana": 175,
			"range": 1
		},
		"traits": [
			"Imperial",
			"Protector",
			"Colossus"
		]
	},
	{
		"ability": {
			"desc": "Garen shrugs off all crowd control effects, empowering his next strike to deal @PercentAD*100@% of his Attack Damage, plus an additional @ModifiedPercentHealth@ of his missing Health in bonus physical damage. (base: @BaseDamage@) This Ability can be cast while stunned.",
			"icon": "ASSETS/Characters/Garen/HUD/Icons2D/Garen_Q.dds",
			"name": "Decisive Strike",
			"variables": [
				{
					"name": "PercentHealth",
					"value": [
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448
					]
				},
				{
					"name": "PercentAD",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				}
			]
		},
		"apiName": "TFT6_Garen",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Garen.TFT_Set6.dds",
		"name": "Garen",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 50,
			"magicResist": 40,
			"mana": 90,
			"range": 1
		},
		"traits": [
			"Academy ",
			"Protector"
		]
	},
	{
		"ability": {
			"desc": "Galio becomes invulnerable and leaps into the sky before crashing down on the largest group of enemies. Enemies within a large radius take @ModifiedDamage@ magic damage and are knocked into the sky. The lower the enemy's maximum Health is compared to Galio's, the further they are knocked up.<br><br>Passive: Galio's Critical Strikes slam the ground, dealing @ModifiedBonusDamage@ bonus magic damage to enemies around his target.",
			"icon": "ASSETS/Characters/Galio/HUD/Icons2D/Galio_R.dds",
			"name": "Colossal Entrance",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						200,
						300,
						9001,
						200,
						200,
						200
					]
				},
				{
					"name": "HexRadius",
					"value": [
						3,
						3,
						3,
						5,
						3,
						3,
						3
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1.5,
						1.25,
						1.75,
						9.5,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "CritBonusDamage",
					"value": [
						0,
						80,
						125,
						1999,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Galio",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Galio.TFT_Set6.dds",
		"name": "Galio",
		"stats": {
			"armor": 70,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 110,
			"hp": 1800,
			"initialMana": 200,
			"magicResist": 70,
			"mana": 300,
			"range": 1
		},
		"traits": [
			"Socialite",
			"Bodyguard",
			"Colossus"
		]
	},
	{
		"ability": {
			"desc": "Ezreal fires a missile at his target, dealing @PercentAD*100@% of his Attack Damage plus @BonusDamage@ bonus physical damage (total: <scaleAD>@TotalDamage@ %i:scaleAD%</scaleAD>). If the missile hits, he grants himself @ModifiedAS@ bonus stacking Attack Speed, up to <scaleAP>@MaxAS@ %i:scaleAP%</scaleAP> at @MaxStacks@ stacks.",
			"icon": "ASSETS/Characters/Ezreal/HUD/Icons2D/Ezreal_Q.dds",
			"name": "Mystic Shot",
			"variables": [
				{
					"name": "BonusDamage",
					"value": [
						0,
						25,
						50,
						100,
						0,
						0,
						0
					]
				},
				{
					"name": "ASBoost",
					"value": [
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224
					]
				},
				{
					"name": "MaxStacks",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				},
				{
					"name": "PercentAD",
					"value": [
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5
					]
				}
			]
		},
		"apiName": "TFT6_Ezreal",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Ezreal.TFT_Set6.dds",
		"name": "Ezreal",
		"stats": {
			"armor": 15,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 15,
			"mana": 40,
			"range": 4
		},
		"traits": [
			"Scrap",
			"Innovator"
		]
	},
	{
		"ability": {
			"desc": "Blitzcrank pulls the farthest enemy, dealing @ModifiedDamage@ magic damage and stunning them for @StunDuration@ seconds. His next attack knocks them up for 1 second. Allies within range will prefer attacking Blitzcrank's target.",
			"icon": "ASSETS/Characters/Blitzcrank/HUD/Icons2D/Blitzcrank_RocketGrab.dds",
			"name": "Rocket Grab",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						150,
						300,
						900,
						950,
						1200,
						1450
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5,
						1.5
					]
				}
			]
		},
		"apiName": "TFT6_Blitzcrank",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Blitzcrank.TFT_Set6.dds",
		"name": "Blitzcrank",
		"stats": {
			"armor": 45,
			"attackSpeed": 0.5,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 650,
			"initialMana": 175,
			"magicResist": 45,
			"mana": 175,
			"range": 1
		},
		"traits": [
			"Scrap",
			"Protector",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Trundle bites his target, dealing @PercentAttackDamage*100@% of his Attack Damage, and reducing the target's Attack Speed by @ASSlow*100@% for @SlowDuration@ seconds. Each bite also steals @ModifiedADSteal@ Attack Damage for the rest of combat. (total: @TotalDamage@)",
			"icon": "ASSETS/Characters/Trundle/HUD/Icons2D/Trundle_Q.dds",
			"name": "Chomp",
			"variables": [
				{
					"name": "PercentAttackDamage",
					"value": [
						1.399999976158142,
						1.399999976158142,
						1.399999976158142,
						1.399999976158142,
						1.399999976158142,
						1.399999976158142,
						1.399999976158142
					]
				},
				{
					"name": "ASSlow",
					"value": [
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25
					]
				},
				{
					"name": "SlowDuration",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "ADSteal",
					"value": [
						0,
						20,
						25,
						40,
						80,
						100,
						120
					]
				}
			]
		},
		"apiName": "TFT6_Trundle",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Trundle.TFT_Set6.dds",
		"name": "Trundle",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 700,
			"initialMana": 40,
			"magicResist": 40,
			"mana": 70,
			"range": 1
		},
		"traits": [
			"Scrap",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Ekko invokes an afterimage that bats a device towards the largest group of units. Upon landing, it deals @ModifiedDamage@ magic damage to enemies within and applies @ASSlow*100@% reduced Attack Speed for @SlowDuration@ seconds. Allies inside gain @ModifiedASBuff@ Attack Speed for @BuffDuration@ seconds.",
			"icon": "ASSETS/Characters/Ekko/HUD/Icons2D/Ekko_W.dds",
			"name": "Parallel Convergence",
			"variables": [
				{
					"name": "FieldDelay",
					"value": [
						2.200000047683716,
						2.200000047683716,
						2.200000047683716,
						2.200000047683716,
						2.200000047683716,
						2.200000047683716,
						2.200000047683716
					]
				},
				{
					"name": "FieldDuration",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				},
				{
					"name": "HexRadius",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				},
				{
					"name": "BonusAS",
					"value": [
						0.10000000149011612,
						0.3499999940395355,
						0.4000000059604645,
						0.5,
						0.8999999761581421,
						1.100000023841858,
						1.2999999523162842
					]
				},
				{
					"name": "ASSlow",
					"value": [
						0,
						0.3499999940395355,
						0.3499999940395355,
						0.5,
						0,
						0,
						0
					]
				},
				{
					"name": "Damage",
					"value": [
						75,
						150,
						200,
						350,
						575,
						700,
						825
					]
				},
				{
					"name": "SlowDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "BuffDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Ekko",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Ekko.TFT_Set6.dds",
		"name": "Ekko",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 650,
			"initialMana": 80,
			"magicResist": 30,
			"mana": 120,
			"range": 1
		},
		"traits": [
			"Scrap",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Ziggs hurls a bomb at his target. After a moderate delay, the bomb lands dealing @ModifiedDamage@ magic damage to the enemy in the epicenter, and half to adjacent enemies.",
			"icon": "ASSETS/Characters/Ziggs/HUD/Icons2D/ZiggsR.dds",
			"name": "Mini Inferno Bomb",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						325,
						425,
						525,
						700,
						500,
						600
					]
				}
			]
		},
		"apiName": "TFT6_Ziggs",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Ziggs.TFT_Set6.dds",
		"name": "Ziggs",
		"stats": {
			"armor": 15,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 15,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Scrap",
			"Yordle",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Jinx rides her rocket into the sky, then comes crashing down near the center-most enemy, dealing @ModifiedDamage@ magic damage to enemies around the epicenter, and @FalloffPercent*100@% to all other enemies in a large area. The epicenter burns every unit except Jinx for @HexDuration@ seconds, dealing @PercentBurn@% of the target's maximum Health as true damage, and reducing healing by 50% for the duration.<br><br>She then swaps to her rocket launcher for the rest of combat, causing her attacks to explode for @RocketLauncherPercentAD*100%@% of her Attack Damage in a small area around her target. (total: <scaleAD>@TooltipDamage@ %i:scaleAD%</scaleAD>)",
			"icon": "ASSETS/Characters/Jinx/HUD/Icons2D/Jinx_R.dds",
			"name": "Super Mega Death Rocket",
			"variables": [
				{
					"name": "Damage",
					"value": [
						500,
						450,
						700,
						8888,
						3000,
						3000,
						3000
					]
				},
				{
					"name": "InnerRadius",
					"value": [
						1,
						1,
						1,
						2,
						1,
						1,
						1
					]
				},
				{
					"name": "OuterRadius",
					"value": [
						3,
						3,
						3,
						5,
						3,
						3,
						3
					]
				},
				{
					"name": "PercentBurn",
					"value": [
						1.5,
						2,
						2.5,
						3,
						3.5,
						4,
						4.5
					]
				},
				{
					"name": "FalloffPercent",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "RocketLauncherPercentAD",
					"value": [
						0.75,
						1.899999976158142,
						2,
						8.880000114440918,
						0.75,
						0.75,
						0.75
					]
				},
				{
					"name": "HexDuration",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				}
			]
		},
		"apiName": "TFT6_Jinx",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Jinx.TFT_Set6.dds",
		"name": "Jinx",
		"stats": {
			"armor": 35,
			"attackSpeed": 1,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 88,
			"hp": 888,
			"initialMana": 0,
			"magicResist": 35,
			"mana": 99,
			"range": 4
		},
		"traits": [
			"Scrap",
			"Sister",
			"Twinshot"
		]
	},
	{
		"ability": {
			"desc": "Fiora becomes untargetable and strikes 4 times at her target's vitals. Each strike deals @PercentAD*100@% of her Attack Damage as physical damage (total:<scaleAD> @TotalDamage@</scaleAD>), @ModifiedBonusDamage@ bonus true damage, and heals her for @PercentHealing*100@% of the total damage dealt.<br><br>If the target dies, Fiora will change targets to the nearest enemy.",
			"icon": "ASSETS/Characters/Fiora/HUD/Icons2D/Fiora_R.dds",
			"name": "Blade Waltz",
			"variables": [
				{
					"name": "PercentAD",
					"value": [
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158,
						1.7000000476837158
					]
				},
				{
					"name": "BonusTrueDamage",
					"value": [
						75,
						60,
						100,
						300,
						400,
						400,
						400
					]
				},
				{
					"name": "PercentHealing",
					"value": [
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224,
						0.20000000298023224
					]
				}
			]
		},
		"apiName": "TFT6_Fiora",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Fiora.TFT_Set6.dds",
		"name": "Fiora",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.8999999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 75,
			"hp": 850,
			"initialMana": 60,
			"magicResist": 40,
			"mana": 140,
			"range": 1
		},
		"traits": [
			"Enforcer",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Poppy throws her buckler at the farthest enemy, dealing @PercentArmorDamage*100@% of her Armor as magic damage. (total: @TotalDamage@) The buckler then bounces back, granting Poppy a shield that blocks @ModifiedShield@ damage.",
			"icon": "ASSETS/Characters/Poppy/HUD/Icons2D/Poppy_Passive.dds",
			"name": "Buckler Toss",
			"variables": [
				{
					"name": "PercentArmorDamage",
					"value": [
						2,
						1.7999999523162842,
						2.0999999046325684,
						2.4000000953674316,
						4,
						4,
						4
					]
				},
				{
					"name": "ShieldAmount",
					"value": [
						100,
						225,
						275,
						325,
						525,
						600,
						700
					]
				}
			]
		},
		"apiName": "TFT6_Poppy",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Poppy.TFT_Set6.dds",
		"name": "Poppy",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 50,
			"magicResist": 40,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Yordle",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Lulu enlarges @NumAllies@ low Health allies, granting them @ModifiedBonusHealth@ bonus Health and knocking up enemies near them. If the ally is already enlarged, they are healed instead.",
			"icon": "ASSETS/Characters/Lulu/HUD/Icons2D/Lulu_GiantGrowth.dds",
			"name": "Wild Growth",
			"variables": [
				{
					"name": "BonusHealth",
					"value": [
						300,
						325,
						350,
						375,
						600,
						1200,
						1200
					]
				},
				{
					"name": "BuffDuration",
					"value": [
						60,
						60,
						60,
						60,
						60,
						60,
						60
					]
				},
				{
					"name": "CCDuration",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "NumAllies",
					"value": [
						1,
						1,
						2,
						3,
						1,
						1,
						1
					]
				}
			]
		},
		"apiName": "TFT6_Lulu",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Lulu.TFT_Set6.dds",
		"name": "Lulu",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 600,
			"initialMana": 60,
			"magicResist": 25,
			"mana": 125,
			"range": 3
		},
		"traits": [
			"Yordle",
			"Enchanter"
		]
	},
	{
		"ability": {
			"desc": "Vex shields herself against @ModifiedShield@ damage over @ShieldDuration@ seconds. When the shield expires, it deals @ModifiedDamage@ magic damage to all enemies within 2 hexes, and an additional @ModifiedBonusDamage@ magic damage if it wasn't destroyed.<br><br>If it was destroyed, Personal Space becomes @ShieldAmp*100@% stronger this combat. This effect can stack.",
			"icon": "ASSETS/Characters/Vex/HUD/Icons2D/Icons_Vex_W01.S_Yordle.dds",
			"name": "Personal Space",
			"variables": [
				{
					"name": "ShieldAmount",
					"value": [
						400,
						550,
						675,
						850,
						900,
						900,
						900
					]
				},
				{
					"name": "ShieldDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "ShieldAmp",
					"value": [
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448,
						0.15000000596046448
					]
				},
				{
					"name": "ShieldDamage",
					"value": [
						125,
						100,
						135,
						175,
						125,
						125,
						125
					]
				},
				{
					"name": "BonusDamage",
					"value": [
						125,
						100,
						135,
						175,
						125,
						125,
						125
					]
				}
			]
		},
		"apiName": "TFT6_Vex",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Vex.TFT_Set6.dds",
		"name": "Vex",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 800,
			"initialMana": 50,
			"magicResist": 40,
			"mana": 100,
			"range": 2
		},
		"traits": [
			"Yordle",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Heimerdinger fires a wave of 5 rockets that converge on his target, each dealing @ModifiedDamage@ magic damage to the first target they hit. Every 3rd cast, Heimerdinger summons @MaxWaves@ waves instead.",
			"icon": "ASSETS/Characters/Heimerdinger/HUD/Icons2D/Heimerdinger_W1.dds",
			"name": "Rocket Swarm",
			"variables": [
				{
					"name": "BaseDamage",
					"value": [
						0,
						70,
						95,
						140,
						75,
						90,
						90
					]
				},
				{
					"name": "MaxWaves",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				}
			]
		},
		"apiName": "TFT6_Heimerdinger",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Heimerdinger.TFT_Set6.dds",
		"name": "Heimerdinger",
		"stats": {
			"armor": 35,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 45,
			"hp": 650,
			"initialMana": 0,
			"magicResist": 35,
			"mana": 50,
			"range": 3
		},
		"traits": [
			"Yordle",
			"Innovator",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Tristana fires a massive cannonball towards her target, dealing @PercentAD*100@% of her Attack Damage plus @ModifiedDamage@ physical damage to the first enemy it hits (total: <scaleAD>@TotalDamage@ %i:scaleAD%</scaleAD>). If the target is within 2 hexes of Tristana, they're knocked back @HexKnockback@ hexes and briefly stunned.",
			"icon": "ASSETS/Characters/Tristana/HUD/Icons2D/Tristana_R.dds",
			"name": "Buster Shot",
			"variables": [
				{
					"name": "PercentAD",
					"value": [
						0,
						2,
						2.0999999046325684,
						2.25,
						0,
						0,
						0
					]
				},
				{
					"name": "BonusDamage",
					"value": [
						0,
						125,
						150,
						175,
						0,
						0,
						0
					]
				},
				{
					"name": "HexKnockback",
					"value": [
						0.5,
						1,
						2,
						3,
						8,
						16,
						32
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "KnockbackRadius",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				}
			]
		},
		"apiName": "TFT6_Tristana",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Tristana.TFT_Set6.dds",
		"name": "Tristana",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 55,
			"hp": 600,
			"initialMana": 0,
			"magicResist": 20,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Yordle",
			"Sniper"
		]
	},
	{
		"ability": {
			"desc": "Janna summons a Monsoon, knocking back nearby enemies and stunning them for @StunDuration@ second(s). The Monsoon heals your team for @ModifiedHeal@ Health over @Duration@ seconds.",
			"icon": "ASSETS/Characters/Janna/HUD/Icons2D/Janna_ReapTheWhirlwind.dds",
			"name": "Monsoon",
			"variables": [
				{
					"name": "HealAmount",
					"value": [
						300,
						275,
						350,
						1000,
						200,
						200,
						100
					]
				},
				{
					"name": "Duration",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "KnockbackRadius",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "StunDuration",
					"value": [
						1.5,
						0.5,
						0.5,
						4,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "TicksPerSecond",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				}
			]
		},
		"apiName": "TFT6_Janna",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Janna.TFT_Set6.dds",
		"name": "Janna",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 700,
			"initialMana": 80,
			"magicResist": 30,
			"mana": 180,
			"range": 3
		},
		"traits": [
			"Scrap",
			"Enchanter",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Kassadin fires an orb of void energy at his target, dealing @ModifiedDamage@ magic damage and granting Kassadin a shield that reduces incoming damage by @DamageReduction*100@% for @Duration@ seconds. Enemies hit by the orb suffer a @ManaReave*100@% increased Mana cost for their next Ability cast.",
			"icon": "ASSETS/Characters/Kassadin/HUD/Icons2D/Kassadin_Q.dds",
			"name": "Null Sphere",
			"variables": [
				{
					"name": "ManaReave",
					"value": [
						0,
						0.5,
						0.5,
						0.5,
						0,
						0,
						0
					]
				},
				{
					"name": "DamageReduction",
					"value": [
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896
					]
				},
				{
					"name": "Damage",
					"value": [
						150,
						250,
						325,
						400,
						150,
						150,
						150
					]
				},
				{
					"name": "Duration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				}
			]
		},
		"apiName": "TFT6_Kassadin",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Kassadin.TFT_Set6.dds",
		"name": "Kassadin",
		"stats": {
			"armor": 35,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 650,
			"initialMana": 60,
			"magicResist": 35,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Mutant",
			"Protector"
		]
	},
	{
		"ability": {
			"desc": "The Bear surges with power, gaining @PercentAD*100@% bonus Attack Damage and granting @AllyADAPBuff@ Attack Damage and Ability Power to your team for @TotalBuffDuration@ seconds.",
			"icon": "ASSETS/Characters/Annie/HUD/Icons2D/Annie_R2.dds",
			"name": "Power Surge",
			"variables": [
				{
					"name": "BuffDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "PercentAD",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "AllyADAPBuff",
					"value": [
						20,
						20,
						20,
						20,
						20,
						20,
						20
					]
				},
				{
					"name": "AllyPercentAD",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				},
				{
					"name": "AllyPercentASBase",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				}
			]
		},
		"apiName": "TFT6_Tibbers",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Tibbers.TFT_Set6.dds",
		"name": "Mechanical Bear",
		"stats": {
			"armor": 60,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.5,
			"damage": 50,
			"hp": 750,
			"initialMana": 0,
			"magicResist": 60,
			"mana": 100,
			"range": 1
		},
		"traits": []
	},
	{
		"ability": {
			"desc": "For the next @ModifiedDuration@ seconds, Urgot attacks the closest enemy at a fixed rate of @AttacksPerSecond@ attacks per second. Each attack deals <scaleAD>@DamagePerShot@</scaleAD> %i:scaleAD% %i:scaleAS% physical damage. (This Ability's damage scales with Attack Damage and Attack Speed.)",
			"icon": "ASSETS/Characters/Urgot/HUD/Icons2D/Urgot_W.dds",
			"name": "Purge",
			"variables": [
				{
					"name": "Duration",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				},
				{
					"name": "AttacksPerSecond",
					"value": [
						5,
						5,
						7,
						12,
						5,
						5,
						5
					]
				},
				{
					"name": "ADRatio",
					"value": [
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25
					]
				},
				{
					"name": "ASRatio",
					"value": [
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896
					]
				},
				{
					"name": "NumShotsPerLaunchAttack",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				}
			]
		},
		"apiName": "TFT6_Urgot",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Urgot.TFT_Set6.dds",
		"name": "Urgot",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 50,
			"range": 3
		},
		"traits": [
			"Chemtech",
			"Twinshot"
		]
	},
	{
		"ability": {
			"desc": "Quinn sends Valor out at the target with the highest Attack Speed, dealing @ModifiedDamage@ magic damage to the target and nearby enemies, disarming them for @DisarmDuration@ seconds.",
			"icon": "ASSETS/Characters/Quinn/HUD/Icons2D/Quinn_Q.dds",
			"name": "Disarming Assault",
			"variables": [
				{
					"name": "BonusDamage",
					"value": [
						0,
						200,
						300,
						700,
						0,
						0,
						0
					]
				},
				{
					"name": "DisarmDuration",
					"value": [
						3,
						2,
						2.5,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "ADReduction",
					"value": null
				},
				{
					"name": "ADReductionDuration",
					"value": null
				}
			]
		},
		"apiName": "TFT6_Quinn",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Quinn.TFT_Set6.dds",
		"name": "Quinn",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 550,
			"initialMana": 70,
			"magicResist": 20,
			"mana": 140,
			"range": 4
		},
		"traits": [
			"Mercenary",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Taric heals himself and the lowest Health ally for @ModifiedHealAmount@. Any overhealing is converted to a shield that lasts @Duration@ seconds.",
			"icon": "ASSETS/Characters/Taric/HUD/Icons2D/Taric_Q.dds",
			"name": "Starlight Bastion",
			"variables": [
				{
					"name": "Duration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "HealAmount",
					"value": [
						0,
						325,
						425,
						600,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Taric",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Taric.TFT_Set6.dds",
		"name": "Taric",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 800,
			"initialMana": 50,
			"magicResist": 50,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Socialite",
			"Enchanter"
		]
	},
	{
		"ability": {
			"desc": "Passive: Talon's first attack on an enemy causes them to bleed for @ModifiedDamage@ magic damage over @BleedDuration@ seconds. Every 3rd attack on a target applies an additional bleed.",
			"icon": "ASSETS/Characters/Talon/HUD/Icons2D/TalonP.dds",
			"name": "Blade's End",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						450,
						625,
						950,
						0,
						0,
						0
					]
				},
				{
					"name": "BleedDuration",
					"value": [
						7,
						7,
						7,
						7,
						7,
						7,
						7
					]
				}
			]
		},
		"apiName": "TFT6_Talon",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Talon.TFT_Set6.dds",
		"name": "Talon",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 650,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 0,
			"range": 1
		},
		"traits": [
			"Imperial",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Kai'sa dashes away from all enemies, then fires a volley of @NumMissiles@ missiles spread evenly among all enemies that deal @ModifiedDamage@ magic damage each.<br><br>For each time Kai'Sa has attacked this combat, she'll fire an additional missile.",
			"icon": "ASSETS/Characters/Kaisa/HUD/Icons2D/Kaisa_Q2.dds",
			"name": "Icathian Monsoon",
			"variables": [
				{
					"name": "NumMissiles",
					"value": [
						4,
						12,
						18,
						100,
						12,
						12,
						12
					]
				},
				{
					"name": "FakeCastTime",
					"value": [
						1,
						1,
						1,
						1,
						1,
						1,
						1
					]
				},
				{
					"name": "Damage",
					"value": [
						50,
						80,
						100,
						180,
						50,
						50,
						50
					]
				}
			]
		},
		"apiName": "TFT6_Kaisa",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Kaisa.TFT_Set6.dds",
		"name": "Kai'Sa",
		"stats": {
			"armor": 30,
			"attackSpeed": 1.2000000476837158,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 900,
			"initialMana": 90,
			"magicResist": 30,
			"mana": 150,
			"range": 3
		},
		"traits": [
			"Mutant",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Braum slams his vault door into the ground, creating a fissure towards his target. Enemies within 2 hexes of Braum, and those struck by the fissure, are stunned for @StunDuration@ seconds and take @ModifiedDamage@ magic damage.",
			"icon": "ASSETS/Characters/Braum/HUD/Icons2D/Braum_R.dds",
			"name": "Vault Breaker",
			"variables": [
				{
					"name": "Damage",
					"value": [
						100,
						100,
						200,
						600,
						100,
						100,
						100
					]
				},
				{
					"name": "StunDuration",
					"value": [
						2.5,
						2,
						3,
						6,
						7,
						7,
						7
					]
				}
			]
		},
		"apiName": "TFT6_Braum",
		"cost": 4,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Braum.TFT_Set6.dds",
		"name": "Braum",
		"stats": {
			"armor": 60,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 1100,
			"initialMana": 100,
			"magicResist": 60,
			"mana": 180,
			"range": 1
		},
		"traits": [
			"Syndicate",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Shaco dips into the shadows, briefly becoming untargetable. His next attack instead deals @PercentOfAD*100@% of his Attack Damage plus @ModifiedDamage@ bonus physical damage, and is guaranteed to critically strike targets below @PercentHealthCrit*100@% Health. (total: <scaleAD>@TotalDamage@ %i:scaleAD%</scaleAD>)",
			"icon": "ASSETS/Characters/Shaco/HUD/Icons2D/Jester_ManiacalCloak2.dds",
			"name": "Deceive",
			"variables": [
				{
					"name": "PercentOfAD",
					"value": [
						1.850000023841858,
						1.850000023841858,
						1.850000023841858,
						1.850000023841858,
						1.850000023841858,
						1.850000023841858,
						1.850000023841858
					]
				},
				{
					"name": "Duration",
					"value": [
						2,
						2,
						2,
						2,
						2,
						2,
						2
					]
				},
				{
					"name": "PercentHealthCrit",
					"value": [
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "BaseDamage",
					"value": [
						0,
						90,
						110,
						130,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Shaco",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Shaco.TFT_Set6.dds",
		"name": "Shaco",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 85,
			"hp": 700,
			"initialMana": 40,
			"magicResist": 25,
			"mana": 80,
			"range": 1
		},
		"traits": [
			"Syndicate",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Akali dashes in a line through the most enemies, dealing @ModifiedInitialDamage@ magic damage and marking them for @MarkDuration@ seconds. When a marked target drops below @ExecuteThreshold*100@% Health, Akali dashes again and executes them, dealing @ModifiedDashDamage@ magic damage to enemies she passes through.",
			"icon": "ASSETS/Characters/Akali/HUD/Icons2D/Akali_R.dds",
			"name": "Perfect Execution",
			"variables": [
				{
					"name": "InitialDamage",
					"value": [
						250,
						275,
						375,
						2000,
						1666,
						1666,
						1666
					]
				},
				{
					"name": "DashDamage",
					"value": [
						250,
						275,
						375,
						2000,
						1666,
						1666,
						1666
					]
				},
				{
					"name": "ExecuteThreshold",
					"value": [
						0,
						0.15000000596046448,
						0.20000000298023224,
						0.8999999761581421,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "MarkDuration",
					"value": [
						7,
						7,
						7,
						7,
						7,
						7,
						7
					]
				}
			]
		},
		"apiName": "TFT6_Akali",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Akali.TFT_Set6.dds",
		"name": "Akali",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.8999999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 40,
			"range": 1
		},
		"traits": [
			"Syndicate",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "The Scarab creates a barrier on itself and the ally targeted by the most enemies, then taunts all enemies who have the Scarab within its attack range, forcing them to attack the Scarab. The barriers last for @DamageReducedDuration@ seconds, reduce incoming damage by @DamageReducedPercent*100@% and enemies attacking the barrier take @ModifiedDamageAmount@ magic damage. Enemies may only take damage from a barrier once per second.",
			"icon": "ASSETS/Characters/TFT6_MalzaharVoidling/HUD/Icons2D/TFT6_MalzaharVoidling_EyeOfTheStorm.TFT_Set6.dds",
			"name": "Reflective Barrier",
			"variables": [
				{
					"name": "DamageReducedPercent",
					"value": [
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25
					]
				},
				{
					"name": "DamageReducedDuration",
					"value": [
						4,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "DamageAmount",
					"value": [
						50,
						50,
						50,
						50,
						50,
						50,
						50
					]
				}
			]
		},
		"apiName": "TFT6_MalzaharVoidling",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Scarab.TFT_Set6.dds",
		"name": "Mechanical Scarab",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 475,
			"initialMana": 40,
			"magicResist": 30,
			"mana": 80,
			"range": 1
		},
		"traits": []
	},
	{
		"ability": {
			"desc": null,
			"icon": "ASSETS/Characters/TFT6_Veigar/HUD/Icons2D/TFT6_Veigar_W.TFT_Set6.dds",
			"name": null,
			"variables": [
				{
					"name": "NumStrikes",
					"value": [
						0,
						20,
						30,
						99,
						0,
						0,
						0
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						250,
						300,
						777,
						250,
						250,
						250
					]
				}
			]
		},
		"apiName": "TFT6_Veigar",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Veigar.TFT_Set6.dds",
		"name": "Veigar",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 45,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 75,
			"range": 4
		},
		"traits": [
			"Yordle-Lord"
		]
	},
	{
		"ability": {
			"desc": "The Dragon lands and lets out a bellowing roar, causing all enemies within @FearHexRange@ hexes to flee for @FearDuration@ seconds. Your team is energized and gains @CritIncrease*100@% Critical Chance and @CritDamageIncrease*100@% Critical Damage for @EnergizedDuration@ seconds.<br><br>Passive: The Dragon is immune to crowd control effects. Every 3rd attack is charged with lightning, dealing @ModifiedLightningDamage@ bonus magic damage to @NumEnemies@ enemies.",
			"icon": "ASSETS/Characters/TFT6_HextechDragon/HUD/Icons2D/DragonSpell.TFT_Set6.dds",
			"name": "Electrifying Roar",
			"variables": [
				{
					"name": "BonusLightningDamage",
					"value": [
						500,
						500,
						500,
						500,
						500,
						500,
						500
					]
				},
				{
					"name": "NumEnemies",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "FearDuration",
					"value": [
						3,
						3,
						3,
						3,
						3,
						3,
						3
					]
				},
				{
					"name": "EnergizedDuration",
					"value": [
						8,
						8,
						8,
						8,
						8,
						8,
						8
					]
				},
				{
					"name": "CritIncrease",
					"value": [
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75,
						0.75
					]
				},
				{
					"name": "CritDamageIncrease",
					"value": [
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645,
						0.4000000059604645
					]
				},
				{
					"name": "FearHexRange",
					"value": [
						5,
						5,
						5,
						5,
						5,
						5,
						5
					]
				}
			]
		},
		"apiName": "TFT_Dragon",
		"cost": 5,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_HextechDragon.TFT_Set6.dds",
		"name": "Mechanical Dragon",
		"stats": {
			"armor": 100,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 1250,
			"initialMana": 200,
			"magicResist": 100,
			"mana": 300,
			"range": 2
		},
		"traits": []
	},
	{
		"ability": {
			"desc": "The Training Dummy cannot move or attack. It is also dressed like a devilishly handsome Yordle.",
			"icon": "ASSETS/Characters/TFTDebug_Dummy/HUD/Icons2D/TFTDebug_Dummy_DoNothing.TFT_1022.dds",
			"name": "On Duty!",
			"variables": []
		},
		"apiName": "TFT_TrainingDummy",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFTDebug_Dummy.TFT_1022.dds",
		"name": "Target Dummy",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.20000000298023224,
			"critChance": null,
			"critMultiplier": 0,
			"damage": 0,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 0,
			"range": 0
		},
		"traits": []
	}
]