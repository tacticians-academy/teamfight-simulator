import type { ChampionData } from '#/helpers/types'

export const champions: ChampionData[] = [
	{
		"ability": {
			"desc": "Ahri fires an orb in a @HexRange@ hex line, dealing @ModifiedDamage@ magic damage to all enemies it passes through on the way out and the way back. Enemies already hit by an orb take @MultiOrbDamage*100@% damage for each subsequent orb. Ahri fires @SpiritFireStacks@ additional orb(s) for each time she has cast this combat.",
			"icon": "ASSETS/Characters/Ahri/HUD/Icons2D/Ahri_OrbofDeception.dds",
			"name": "Orbs of Deception",
			"variables": [
				{
					"name": "Damage",
					"value": [
						150,
						120,
						180,
						450,
						500,
						400,
						400
					]
				},
				{
					"name": "HexRange",
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
					"name": "SpiritFireStacks",
					"value": [
						0,
						1,
						1,
						2,
						0,
						0,
						0
					]
				},
				{
					"name": "MultiOrbDamage",
					"value": [
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929,
						0.800000011920929
					]
				},
				{
					"name": "AngleBetweenOrbs",
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
		"apiName": "TFT6_Ahri",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Ahri.TFT_Set6_Stage2.dds",
		"name": "Ahri",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 45,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 50,
			"range": 4
		},
		"traits": [
			"Syndicate",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Alistar charges at his target, knocking them back for a short distance. Then he slams the ground, dealing @ModifiedDamage@ magic damage and stunning all nearby enemies for @StunDuration@ seconds. ",
			"icon": "ASSETS/Characters/TFT6_Alistar/HUD/Icons2D/TFT6_Alistar_Q.TFT_Set6_Stage2.dds",
			"name": "Pulverize",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						200,
						350,
						1200,
						1000,
						1000,
						900
					]
				},
				{
					"name": "Radius",
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
					"name": "StunDuration",
					"value": [
						1.5,
						2,
						2.5,
						8,
						3.5,
						4,
						4.5
					]
				},
				{
					"name": "KnockupDuration",
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
		"apiName": "TFT6_Alistar",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Alistar.TFT_Set6_Stage2.dds",
		"name": "Alistar",
		"stats": {
			"armor": 70,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 100,
			"hp": 1300,
			"initialMana": 85,
			"magicResist": 70,
			"mana": 170,
			"range": 1
		},
		"traits": [
			"Hextech",
			"Colossus"
		]
	},
	{
		"ability": {
			"desc": "Ashe fires a volley of @NumOfArrows@ arrows centered on her target, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage per arrow (@ADPercent*100@% of her Attack Damage %i:scaleAD%) and slowing their Attack Speed by @ASReduction@% for @ModifiedDuration@ seconds.",
			"icon": "ASSETS/Characters/Ashe/HUD/Icons2D/Ashe_W.dds",
			"name": "Volley",
			"variables": [
				{
					"name": "ADPercent",
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
					"name": "NumOfArrows",
					"value": [
						0,
						6,
						7,
						8,
						0,
						0,
						0
					]
				},
				{
					"name": "ASReduction",
					"value": [
						15,
						15,
						15,
						15,
						15,
						15,
						15
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
				}
			]
		},
		"apiName": "TFT6_Ashe",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Ashe.TFT_Set6_Stage2.dds",
		"name": "Ashe",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 600,
			"initialMana": 30,
			"magicResist": 20,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Syndicate",
			"Sniper"
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
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Brand launches a fireball at the nearest enemy, lighting them ablaze for @BlazeDuration@ seconds and dealing @ModifiedDamage@ magic damage. If the enemy is already on fire, they take @ModifiedBonusDamage@ bonus magic damage which stuns them for @StunDuration@ seconds. (total: @TotalDamage@%i:scaleAP%)<br><br><TFTDebonairVIP>VIP Bonus: Brand fires a 2nd fireball at a different nearby target (prioritizes ablaze enemies) dealing @VIPBonusReducedDamage@% reduced damage . </TFTDebonairVIP>",
			"icon": "ASSETS/Characters/Brand/HUD/Icons2D/BrandQ.dds",
			"name": "Sear",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						100,
						150,
						200,
						0,
						0,
						0
					]
				},
				{
					"name": "BlazeDuration",
					"value": [
						0,
						4,
						4,
						4,
						4,
						4,
						4
					]
				},
				{
					"name": "BonusDamage",
					"value": [
						0,
						150,
						225,
						300,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						0,
						1,
						1.5,
						2,
						0,
						0,
						0
					]
				},
				{
					"name": "VIPBonusReducedDamage",
					"value": [
						25,
						25,
						25,
						25,
						25,
						25,
						25
					]
				}
			]
		},
		"apiName": "TFT6_Brand",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Brand.TFT_Set6_Stage2.dds",
		"name": "Brand",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 500,
			"initialMana": 0,
			"magicResist": 20,
			"mana": 20,
			"range": 3
		},
		"traits": [
			"Debonair",
			"Arcanist"
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
						1.75,
						2.25,
						8,
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
			"initialMana": 120,
			"magicResist": 60,
			"mana": 200,
			"range": 1
		},
		"traits": [
			"Syndicate",
			"Bodyguard"
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
						2000,
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
			"desc": "Cho'Gath devours the lowest Health enemy within range, dealing @ModifiedDamage@ magic damage. If this kills the target, Cho'Gath gains a stack of Feast (increased to two in Hyper Roll), up to @MaxFeastStacks@. Each stack of Feast permanently grants @BonusHealthOnKill*100@% bonus Health and size. ",
			"icon": "ASSETS/Characters/Chogath/HUD/Icons2D/GreenTerror_Feast.dds",
			"name": "Feast",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						900,
						975,
						1050,
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
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 700,
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
			"desc": "Corki fires a missile at his target that explodes on impact, dealing @ModifiedDamage@ magic damage to enemies within 1 hex.",
			"icon": "ASSETS/Characters/Corki/HUD/Icons2D/Corki_MissileBarrage.dds",
			"name": "Bombardment",
			"variables": [
				{
					"name": "RocketDamage",
					"value": [
						0,
						200,
						260,
						333,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Corki",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Corki.TFT_Set6_Stage2.dds",
		"name": "Corki",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 650,
			"initialMana": 25,
			"magicResist": 25,
			"mana": 50,
			"range": 4
		},
		"traits": [
			"Yordle",
			"Twinshot"
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
			"desc": "Draven starts spinning an axe, empowering his next attack to deal <scaleAD>@TotalDamage@</scaleAD> bonus physical damage (@ADMult*100@% of his Attack Damage %i:scaleAD% + @ModifiedDamage@). It will return to his original location after striking the target. If Draven catches it, he will empower the axe again. Draven can spin up to 2 axes at a time.<br><br><TFTDebonairVIP>VIP Bonus: Draven gains infinite attack range and ignores @ArmorPenPercent@% his target's Armor.</TFTDebonairVIP>",
			"icon": "ASSETS/Characters/Draven/HUD/Icons2D/Draven_SpinningAxe.dds",
			"name": "Spinning Axes",
			"variables": [
				{
					"name": "BuffDuration",
					"value": [
						5.75,
						5.75,
						5.75,
						5.75,
						5.75,
						5.75,
						5.75
					]
				},
				{
					"name": "ADMult",
					"value": [
						1,
						1.5,
						1.600000023841858,
						4,
						3,
						3.5,
						4
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						150,
						200,
						500,
						0,
						0,
						0
					]
				},
				{
					"name": "ArmorPenPercent",
					"value": [
						50,
						50,
						50,
						50,
						50,
						50,
						50
					]
				},
				{
					"name": "T1DebutantBonus",
					"value": [
						2.5,
						2.5,
						2.5,
						2.5,
						2.5,
						2.5,
						2.5
					]
				}
			]
		},
		"apiName": "TFT6_Draven",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Draven.TFT_Set6_Stage2.dds",
		"name": "Draven",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 40,
			"range": 3
		},
		"traits": [
			"Debonair",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Ekko invokes an afterimage that bats a device towards the largest group of units. Upon landing, it deals @ModifiedDamage@ magic damage to enemies within and applies @ASSlow*100@% reduced Attack Speed for @SlowDuration@ seconds. Allies inside gain @ModifiedASBuff@ bonus Attack Speed for @BuffDuration@ seconds.",
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
			"armor": 40,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 700,
			"initialMana": 80,
			"magicResist": 40,
			"mana": 120,
			"range": 1
		},
		"traits": [
			"Scrap",
			"Innovator",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Ezreal fires a missile at his target, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage (@PercentAD*100@% of his Attack Damage %i:scaleAD% + @BonusDamage@). If the missile hits, he grants himself @ModifiedAS@ bonus stacking Attack Speed, up to <scaleAP>@MaxAS@ %i:scaleAP%</scaleAP> at @MaxStacks@ stacks.",
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
			"desc": "Galio becomes invulnerable and leaps into the sky before crashing down on the largest group of enemies. Enemies within a large radius take <scaleAP>@TotalDamage@</scaleAP> magic damage (@ModifiedDamage@ + @MaxHealthPercent*100@% of Galio's <health>maximum Health</health> %i:scaleHealth%) and are knocked up for @StunDuration@ second(s).<br><br>Passive: Galio's Critical Strikes slam the ground, dealing @ModifiedBonusDamage@ bonus magic damage to enemies around his target.",
			"icon": "ASSETS/Characters/Galio/HUD/Icons2D/Galio_R.dds",
			"name": "Colossal Entrance",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						150,
						225,
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
						1,
						1,
						1.5,
						10,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "CritBonusDamage",
					"value": [
						0,
						70,
						100,
						1999,
						0,
						0,
						0
					]
				},
				{
					"name": "MaxHealthPercent",
					"value": [
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806,
						0.05000000074505806
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
			"hp": 1200,
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
			"desc": "Gangplank attacks his target with his gun, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage (@ADPercent*100@% of his Attack Damage %i:scaleAD% + @ModifiedDamage@). If this attack kills a champion, Gangplank plunders 1 gold. ",
			"icon": "ASSETS/Characters/Gangplank/HUD/Icons2D/Gangplank_Q.dds",
			"name": "Parrrley",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						120,
						160,
						225,
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
			"desc": "Gnar transforms into Mega Gnar for the rest of combat. Mega Gnar throws a boulder at the farthest enemy within 3 hexes, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage (@ADPercent*100@% of his Attack Damage %i:scaleAD% + @Damage@) to all enemies it passes through. <br><br>While in Mega Gnar form, Gnar is melee, gains @ModifiedTransformHealth@ Health, and his mana costs are reduced by @TransformManaReduc@.",
			"icon": "ASSETS/Characters/Gnar/HUD/Icons2D/GnarBig_R.dds",
			"name": "GNAR!",
			"variables": [
				{
					"name": "RCCDuration",
					"value": [
						1.5,
						1.5,
						2,
						3,
						1.5,
						1.5,
						1.5
					]
				},
				{
					"name": "RKnockbackDistance",
					"value": null
				},
				{
					"name": "TransformDuration",
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
					"name": "TransformHealth",
					"value": [
						50,
						500,
						750,
						1200,
						850,
						1050,
						1250
					]
				},
				{
					"name": "ADPercent",
					"value": [
						0,
						1.75,
						1.75,
						1.75,
						200,
						250,
						300
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						150,
						200,
						300,
						0,
						0,
						0
					]
				},
				{
					"name": "TransformManaReduc",
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
		"apiName": "TFT6_Gnar",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Gnar.TFT_Set6_Stage2.dds",
		"name": "Gnar",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 700,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 80,
			"range": 3
		},
		"traits": [
			"Yordle",
			"Socialite",
			"Striker"
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
						200,
						325,
						550,
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
						0.4000000059604645,
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
			"desc": "Irelia dashes to her target, striking them for <scaleAD>@TooltipDamage@</scaleAD> physical damage (@PercentADDamage*100@% of her Attack Damage %i:scaleAD% + @ModifiedDamage@). If this kills the target, she Bladesurges again at the lowest Health enemy.",
			"icon": "ASSETS/Characters/Irelia/HUD/Icons2D/Irelia_Q.dds",
			"name": "Bladesurge",
			"variables": [
				{
					"name": "PercentADDamage",
					"value": [
						0,
						1.7999999523162842,
						1.7999999523162842,
						1.7999999523162842,
						0,
						0,
						0
					]
				},
				{
					"name": "BaseDamage",
					"value": [
						0,
						100,
						150,
						500,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Irelia",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Irelia.TFT_Set6_Stage2.dds",
		"name": "Irelia",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.8500000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 900,
			"initialMana": 0,
			"magicResist": 50,
			"mana": 30,
			"range": 1
		},
		"traits": [
			"Scrap",
			"Striker"
		]
	},
	{
		"ability": {
			"desc": "Jarvan calls down his standard to a nearby location, granting all nearby allies @ModifiedAS@ Attack Speed for @Duration@ seconds.",
			"icon": "ASSETS/Characters/JarvanIV/HUD/Icons2D/JarvanIV_DemacianStandard.dds",
			"name": "Ageless Standard",
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
					"name": "HexRadius",
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
					"name": "ASPercent",
					"value": [
						0.6499999761581421,
						0.4000000059604645,
						0.5,
						0.699999988079071,
						1.0499999523162842,
						1.149999976158142,
						1.25
					]
				}
			]
		},
		"apiName": "TFT6_JarvanIV",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_JarvanIV.TFT_Set6_Stage2.dds",
		"name": "Jarvan IV",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 55,
			"hp": 700,
			"initialMana": 60,
			"magicResist": 40,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Hextech",
			"Striker"
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
			"desc": "Jhin transforms his weapon into a powerful sniper rifle for his next 4 shots. Each shot deals <scaleAD>@TotalDamage@</scaleAD> physical damage (@PercentAttackDamage*100@% of his Attack Damage %i:scaleAD%), reduced by @DamageFalloff*100@% for each target it pierces through. The 4th shot is guaranteed to critically strike, and deals @ModifiedBonusDamage@ more damage based on his target's missing Health.<br><br>Passive: Jhin always attacks @AttackSpeed@ times per second. He converts each 1% of bonus Attack Speed into @ADFromAttackSpeed@ Attack Damage.",
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
						3,
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
			"desc": "Jinx rides her rocket into the sky, then comes crashing down near the center-most enemy, dealing @ModifiedDamage@ magic damage to enemies around the epicenter, and @FalloffPercent*100@% to all other enemies in a large area. The epicenter burns every unit except Jinx for @HexDuration@ seconds, dealing @PercentBurn@% of the target's maximum Health as true damage, and reducing healing by 50% for the duration.<br><br>She then swaps to her rocket launcher and targets random units for the rest of combat. Her attacks now explode for <scaleAD>@TooltipDamage@</scaleAD> physical damage (@RocketLauncherPercentAD*100%@% of her Attack Damage %i:scaleAD%) in a small area around her target.",
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
						1,
						2,
						3,
						4,
						5,
						6,
						7
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
						2.200000047683716,
						2.299999952316284,
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
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6b_Jinx.dds",
		"name": "Jinx",
		"stats": {
			"armor": 40,
			"attackSpeed": 1,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 88,
			"hp": 888,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 99,
			"range": 4
		},
		"traits": [
			"Scrap",
			"Rival",
			"Twinshot"
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
						70,
						90,
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
			"attackSpeed": 1.100000023841858,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 850,
			"initialMana": 75,
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
			"desc": "Kassadin fires an orb of void energy at his target, dealing @ModifiedDamage@ magic damage. Enemies hit by the orb suffer a @ManaReave*100@% increased Mana cost for their next Ability cast. Kassadin also grants himself a @ModifiedShieldAmount@ shield and takes @DamageReduction*100@% less damage for @Duration@ seconds. ",
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
					"name": "ShieldAmount",
					"value": [
						0,
						150,
						250,
						350,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Kassadin",
		"cost": 1,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Kassadin.TFT_Set6.dds",
		"name": "Kassadin",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 750,
			"initialMana": 60,
			"magicResist": 40,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Mutant",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Kha'Zix leaps towards the lowest Health enemy, striking them for <scaleAD>@TotalDamage@</scaleAD> physical damage (@ADPercent*100@% of his Attack Damage %i:scaleAD% + @ModifiedDamage@) and increasing their maximum Mana by @ManaReave@% until they cast.",
			"icon": "ASSETS/Characters/KhaZix/HUD/Icons2D/Khazix_R.dds",
			"name": "Arid Assault",
			"variables": [
				{
					"name": "MSBuff",
					"value": [
						1350,
						1350,
						1350,
						1350,
						1350,
						1350,
						1350
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						175,
						225,
						500,
						500,
						500,
						500
					]
				},
				{
					"name": "ManaReave",
					"value": [
						0,
						50,
						50,
						50,
						20,
						25,
						30
					]
				},
				{
					"name": "ADPercent",
					"value": [
						0,
						1.7999999523162842,
						1.850000023841858,
						2,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_KhaZix",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_KhaZix.TFT_Set6_Stage2.dds",
		"name": "Kha'Zix",
		"stats": {
			"armor": 35,
			"attackSpeed": 0.8999999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 90,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 35,
			"mana": 40,
			"range": 1
		},
		"traits": [
			"Mutant",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Leona calls down a beacon of light upon herself, granting herself a @ModifiedShielding@ Health shield for @Duration@ seconds. Leona and allies within 2 hexes gain @BonusStats@ Armor and Magic Resistance for the same duration.<br><br><TFTDebonairVIP>VIP Bonus: Every second, Leona heals herself for @T1DebutantBonus@% max health for each unit targeting her.</TFTDebonairVIP>",
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
				},
				{
					"name": "T1DebutantBonus",
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
		"apiName": "TFT6_Leona",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Leona.TFT_Set6_Stage2.dds",
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
			"Debonair",
			"Bodyguard"
		]
	},
	{
		"ability": {
			"desc": "Lucian dashes away from his current target and fires @NumShots@ shots at nearby enemies that each deal @ModifiedDamage@ magic damage.",
			"icon": "ASSETS/Characters/Lucian/HUD/Icons2D/Lucian_E.dds",
			"name": "Relentless Pursuit",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						175,
						275,
						300,
						500,
						625,
						750
					]
				},
				{
					"name": "NumShots",
					"value": [
						0,
						2,
						2,
						3,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Lucian",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Lucian.TFT_Set6_Stage2.dds",
		"name": "Lucian",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 650,
			"initialMana": 0,
			"magicResist": 25,
			"mana": 40,
			"range": 3
		},
		"traits": [
			"Hextech",
			"Twinshot"
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
			"desc": "Malzahar infects the mind of the closest unafflicted target, dealing @ModifiedDamage@ magic damage over @Duration@ seconds and reducing the Magic Resist of enemies by @MRShred*100@%.<br><br>If an afflicted target dies, Malefic Visions spreads to the nearest @SpreadTargets@ unafflicted targets with the remaining duration.",
			"icon": "ASSETS/Characters/Malzahar/HUD/Icons2D/Malzahar_E.dds",
			"name": "Malefic Visions",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						625,
						875,
						1050,
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
			"armor": 70,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.5,
			"damage": 50,
			"hp": 850,
			"initialMana": 0,
			"magicResist": 70,
			"mana": 100,
			"range": 1
		},
		"traits": []
	},
	{
		"ability": {
			"desc": "Passive: The Dragon is immune to crowd control effects. Every 3rd attack is charged with lightning, dealing @ModifiedLightningDamage@ bonus magic damage to @NumEnemies@ enemies.<br><br>The Dragon lands and lets out a bellowing roar, causing all enemies within @FearHexRange@ hexes to cower in fear for @FearDuration@ seconds. Your team is energized and gains @CritIncrease*100@% Critical Chance and @CritDamageIncrease*100@% Critical Damage for @EnergizedDuration@ seconds.",
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
						0.10000000149011612,
						0.10000000149011612,
						0.10000000149011612,
						0.10000000149011612,
						0.10000000149011612,
						0.10000000149011612,
						0.10000000149011612
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
		"apiName": "TFT6_HexTechDragon",
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
						600,
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
			"desc": "Morgana grants herself a @ModifiedShieldAmount@ shield for @ShieldDuration@ seconds and shackles herself to all enemies in a @Radius@ hex radius. She then deals @ModifiedDamagePerSecond@ magic damage per second to them, as long as the shield holds. <br><br>If the shield expires without being broken, all targets are stunned for @StunDuration@ seconds. If the shield is broken, Morgana instead refunds herself @RefundedMana@ mana.",
			"icon": "ASSETS/Characters/Morgana/HUD/Icons2D/FallenAngel_Purgatory.dds",
			"name": "Soul Shackles",
			"variables": [
				{
					"name": "ShieldAmount",
					"value": [
						50,
						400,
						550,
						750,
						550,
						675,
						800
					]
				},
				{
					"name": "ShieldDuration",
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
					"name": "Radius",
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
					"name": "DamagePerSecond",
					"value": [
						0,
						150,
						225,
						325,
						0,
						0,
						0
					]
				},
				{
					"name": "RefundedMana",
					"value": [
						30,
						30,
						30,
						30,
						30,
						30,
						30
					]
				}
			]
		},
		"apiName": "TFT6_Morgana",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Morgana.TFT_Set6_Stage2.dds",
		"name": "Morgana",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 800,
			"initialMana": 60,
			"magicResist": 50,
			"mana": 120,
			"range": 2
		},
		"traits": [
			"Syndicate",
			"Enchanter"
		]
	},
	{
		"ability": {
			"desc": "Nocturne terrifies his target, stunning them with fear for @StunDuration@ seconds and dealing @ModifiedDamage@ magic damage over the duration.",
			"icon": "ASSETS/Characters/Nocturne/HUD/Icons2D/Nocturne_UnspeakableHorror.dds",
			"name": "Unspeakable Horror",
			"variables": [
				{
					"name": "Damage",
					"value": [
						200,
						200,
						300,
						400,
						500,
						500,
						500
					]
				},
				{
					"name": "StunDuration",
					"value": [
						2,
						2,
						2.5,
						3.5,
						3.5,
						2.5,
						2.5
					]
				}
			]
		},
		"apiName": "TFT6_Nocturne",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Nocturne.TFT_Set6_Stage2.dds",
		"name": "Nocturne",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 600,
			"initialMana": 40,
			"magicResist": 25,
			"mana": 80,
			"range": 1
		},
		"traits": [
			"Hextech",
			"Assassin"
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
						150,
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
						325,
						500,
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
			"mana": 130,
			"range": 4
		},
		"traits": [
			"Clockwork",
			"Enchanter"
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
			"desc": "Rek'Sai bites her target, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage (@ADPercent*100@% of her Attack Damage %i:scaleAD% + @ModifiedDamage@), stealing @ResistPercentSteal*100@% of her target's Armor and Magic Resist, and healing herself for @Heal@ health.",
			"icon": "ASSETS/Characters/RekSai/HUD/Icons2D/RekSai_E1.dds",
			"name": "Furious Bite",
			"variables": [
				{
					"name": "ADPercent",
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
					"name": "ResistPercentSteal",
					"value": [
						0,
						0.30000001192092896,
						0.4000000059604645,
						0.6000000238418579,
						0,
						0,
						0
					]
				},
				{
					"name": "Damage",
					"value": [
						0,
						100,
						150,
						200,
						0,
						0,
						0
					]
				},
				{
					"name": "Heal",
					"value": [
						0,
						100,
						200,
						500,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_RekSai",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_RekSai.TFT_Set6_Stage2.dds",
		"name": "Rek'Sai",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 800,
			"initialMana": 60,
			"magicResist": 40,
			"mana": 90,
			"range": 1
		},
		"traits": [
			"Mutant",
			"Striker",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Renata unleashes a toxic poison wave towards the largest group of nearby enemies within @SpellRange@ hexes, poisoning all enemies caught in its path for @Duration@ seconds. Poisoned enemies suffer @ASReduction@% reduced Attack Speed and take @ModifiedDamagePerSecond@ magic damage per second. Damage dealt by the poison can stack.",
			"icon": "ASSETS/Characters/TFT6_Renata/HUD/Icons2D/Renata_ToxicWave_2.dds",
			"name": "Toxic Wave",
			"variables": [
				{
					"name": "DamagePerSecond",
					"value": [
						1,
						40,
						70,
						150,
						2,
						2.25,
						2.5
					]
				},
				{
					"name": "ASReduction",
					"value": [
						0.30000001192092896,
						15,
						15,
						15,
						0.30000001192092896,
						0.30000001192092896,
						0.30000001192092896
					]
				},
				{
					"name": "Duration",
					"value": [
						15,
						15,
						15,
						15,
						15,
						15,
						15
					]
				},
				{
					"name": "SpellRange",
					"value": [
						6,
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
		"apiName": "TFT6_Renata",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Renata.TFT_Set6_Stage2.dds",
		"name": "Renata Glasc",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 800,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 60,
			"range": 3
		},
		"traits": [
			"Chemtech",
			"Scholar"
		]
	},
	{
		"ability": {
			"desc": "Sejuani signals Bristle to charge, dealing @ModifiedDamage@ magic damage and stunning her target for @StunDuration@ seconds. She then gains Frost Armor, granting her @DefensiveStats@ Armor and Magic Resist for @Duration@ seconds. ",
			"icon": "ASSETS/Characters/Sejuani/HUD/Icons2D/Sejuani_passive.dds",
			"name": "Fury of the North",
			"variables": [
				{
					"name": "DefensiveStats",
					"value": [
						0,
						75,
						100,
						150,
						0,
						0,
						0
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
				},
				{
					"name": "StunDuration",
					"value": [
						0,
						1.5,
						2,
						3,
						0,
						0,
						0
					]
				},
				{
					"name": "MagicDamage",
					"value": [
						0,
						275,
						400,
						650,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Sejuani",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Sejuani.TFT_Set6_Stage2.dds",
		"name": "Sejuani",
		"stats": {
			"armor": 45,
			"attackSpeed": 0.550000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 65,
			"hp": 800,
			"initialMana": 20,
			"magicResist": 45,
			"mana": 80,
			"range": 1
		},
		"traits": [
			"Hextech",
			"Enforcer",
			"Bruiser"
		]
	},
	{
		"ability": {
			"desc": "Senna fires a beam in the direction of her target, dealing <scaleAD>@TotalDamage@</scaleAD> physical damage (@PercentAD*100@% of her Attack Damage %i:scaleAD% + @Damage@). For each enemy hit, she heals the lowest health ally for @ModifiedPercentHealing@ of the damage dealt.",
			"icon": "ASSETS/Characters/Senna/HUD/Icons2D/Senna_Q.dds",
			"name": "Piercing Darkness",
			"variables": [
				{
					"name": "PercentAD",
					"value": [
						1.600000023841858,
						1.600000023841858,
						1.600000023841858,
						1.600000023841858,
						1.600000023841858,
						1.600000023841858,
						1.600000023841858
					]
				},
				{
					"name": "PercentHealing",
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
					"name": "BaseHealing",
					"value": null
				},
				{
					"name": "Damage",
					"value": [
						0,
						80,
						125,
						200,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Senna",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Senna.TFT_Set6_Stage2.dds",
		"name": "Senna",
		"stats": {
			"armor": 25,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 650,
			"initialMana": 30,
			"magicResist": 25,
			"mana": 80,
			"range": 4
		},
		"traits": [
			"Socialite",
			"Enchanter"
		]
	},
	{
		"ability": {
			"desc": "Seraphine projects her song towards the largest group of enemy units, dealing @ModifiedDamage@ magic damage to enemies. Allies it passes through are healed for @ModifiedHeal@ Health and gain @ASBonus*100@% bonus Attack Speed for @ASBonusDuration@ seconds.",
			"icon": "ASSETS/Characters/Seraphine/HUD/Icons2D/Seraphine_R.EllipsisMage.dds",
			"name": "Encore",
			"variables": [
				{
					"name": "Damage",
					"value": [
						1,
						275,
						450,
						1200,
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
						350,
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
			"mana": 150,
			"range": 4
		},
		"traits": [
			"Socialite",
			"Innovator"
		]
	},
	{
		"ability": {
			"desc": "Silco injects an unstable concoction into @NumTargets@ of his lowest Health allies, granting them @MaxHealth*100@% maximum Health, @AttackSpeed*100@% bonus Attack Speed, and immunity to crowd control for @Duration@ seconds. When the concoction wears off, unstable units die by explosion, dealing @ModifiedDamage@ magic damage to nearby enemies.",
			"icon": "ASSETS/Characters/TFT6_Silco/HUD/Icons2D/TFT6_Silco_EyeOfTheStorm.TFT_Set6_Stage2.dds",
			"name": "Unstable Concoction",
			"variables": [
				{
					"name": "NumTargets",
					"value": [
						0,
						1,
						1,
						5,
						4,
						5,
						6
					]
				},
				{
					"name": "AttackSpeed",
					"value": [
						50,
						0.800000011920929,
						1.75,
						6.659999847412109,
						0.5,
						0.5,
						0.5
					]
				},
				{
					"name": "MaxHealth",
					"value": [
						70,
						0.5,
						0.5,
						0.5,
						70,
						70,
						70
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
					"name": "Damage",
					"value": [
						0,
						250,
						500,
						5000,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Silco",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Silco.TFT_Set6_Stage2.dds",
		"name": "Silco",
		"stats": {
			"armor": 40,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 60,
			"hp": 850,
			"initialMana": 0,
			"magicResist": 40,
			"mana": 40,
			"range": 4
		},
		"traits": [
			"Mastermind",
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
			"desc": "For the next @Duration@ seconds, Sivir grants herself @ModifiedAttackSpeed@ bonus Attack Speed and her attacks bounce up to @NumBounces@ times, dealing <scaleAD>@DamageCalc@</scaleAD> physical damage (@PercentDamage*100@% of her Attack Damage %i:scaleAD%) to enemies hit.",
			"icon": "ASSETS/Characters/Sivir/HUD/Icons2D/Sivir_W.dds",
			"name": "Ricochet",
			"variables": [
				{
					"name": "PercentDamage",
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
					"name": "NumBounces",
					"value": [
						3,
						4,
						5,
						9,
						11,
						13,
						15
					]
				},
				{
					"name": "BounceRange",
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
					"name": "BonusAttackSpeed",
					"value": [
						0,
						0.5,
						0.75,
						2,
						0,
						0,
						0
					]
				}
			]
		},
		"apiName": "TFT6_Sivir",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Sivir.TFT_Set6_Stage2.dds",
		"name": "Sivir",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 700,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 60,
			"range": 4
		},
		"traits": [
			"Hextech",
			"Striker"
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
						225,
						300,
						450,
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
						225,
						250,
						350,
						80,
						80,
						80
					]
				}
			]
		},
		"apiName": "TFT6_Swain",
		"cost": 2,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Swain.TFT_Set6_Stage2.dds",
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
			"mana": 85,
			"range": 2
		},
		"traits": [
			"Hextech",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Syndra flings the nearest enemy towards the farthest enemy, dealing @ModifiedDamage@ magic damage to all enemies within 1 hex upon impact and stunning the thrown target for @StunDuration@ seconds.<br><br><TFTDebonairVIP>VIP Bonus: Force of Will's impact area is 1 hex larger and knocks up affected enemies for @VIPDebutantBonus@ seconds.</TFTDebonairVIP>",
			"icon": "ASSETS/Characters/Syndra/HUD/Icons2D/SyndraW2.dds",
			"name": "Force of Will",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						225,
						325,
						500,
						0,
						0,
						0
					]
				},
				{
					"name": "StunDuration",
					"value": [
						0,
						2,
						2.5,
						3,
						0,
						0,
						0
					]
				},
				{
					"name": "VIPDebutantBonus",
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
		"apiName": "TFT6_Syndra",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Syndra.TFT_Set6_Stage2.dds",
		"name": "Syndra",
		"stats": {
			"armor": 20,
			"attackSpeed": 0.6499999761581421,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 40,
			"hp": 600,
			"initialMana": 50,
			"magicResist": 20,
			"mana": 100,
			"range": 4
		},
		"traits": [
			"Debonair",
			"Scholar"
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
						1000,
						1500,
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
						350,
						525,
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
			"desc": "Passive: Talon's 1st attack on an enemy causes them to bleed for @ModifiedDamage@ magic damage over @BleedDuration@ seconds. Every 3rd attack on a target applies an additional bleed.<br><br><TFTDebonairVIP>VIP Bonus: Talon's bleed now deals true damage and lasts @VIPBleedDurationBonus@% longer.</TFTDebonairVIP>",
			"icon": "ASSETS/Characters/Talon/HUD/Icons2D/TalonP.dds",
			"name": "Blade's End",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						450,
						650,
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
				},
				{
					"name": "VIPBleedDurationBonus",
					"value": [
						100,
						100,
						100,
						100,
						100,
						100,
						100
					]
				}
			]
		},
		"apiName": "TFT6_Talon",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Talon.TFT_Set6_Stage2.dds",
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
			"Debonair",
			"Assassin"
		]
	},
	{
		"ability": {
			"desc": "Tryndamere spins in a line towards the most enemies, dealing <scaleAD>@TooltipDamage@</scaleAD> physical damage (@SpinDamage*100@% of his Attack Damage %i:scaleAD% + @ModifiedDamage@) to enemies in his path and empowering his next 3 attacks to deal @BonusAAPercent*100@% more damage.",
			"icon": "ASSETS/Characters/Tryndamere/HUD/Icons2D/Tryndamere_E.dds",
			"name": "Spinning Slash",
			"variables": [
				{
					"name": "SpinDamage",
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
					"name": "BaseSpinDamage",
					"value": [
						0,
						80,
						120,
						240,
						0,
						0,
						0
					]
				},
				{
					"name": "BonusAAPercent",
					"value": [
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25,
						0.25
					]
				}
			]
		},
		"apiName": "TFT6_Tryndamere",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Tryndamere.TFT_Set6_Stage2.dds",
		"name": "Tryndamere",
		"stats": {
			"armor": 35,
			"attackSpeed": 0.75,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 70,
			"hp": 750,
			"initialMana": 40,
			"magicResist": 35,
			"mana": 100,
			"range": 1
		},
		"traits": [
			"Chemtech",
			"Challenger"
		]
	},
	{
		"ability": {
			"desc": "Twitch fires a powerful bolt towards his target that pierces through enemies, deals <scaleAD>@TotalDamage@</scaleAD> physical damage (@PercentAttackDamage*100@% of his Attack Damage %i:scaleAD% + @ModifiedDamage@), and reduces healing by @GWStrength*100@% for @GWDuration@ seconds.",
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
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Twitch.TFT_Set6_Stage2.dds",
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
			"desc": "Vex shields herself against @ModifiedShield@ damage over @ShieldDuration@ seconds. When the shield expires, it deals @ModifiedDamage@ magic damage to all enemies within 2 hexes, and an additional @ModifiedBonusDamage@ magic damage if it wasn't destroyed.<br><br>If it was destroyed, Personal Space becomes @ShieldAmp*100@% stronger this combat. This effect can stack.",
			"icon": "ASSETS/Characters/Vex/HUD/Icons2D/Icons_Vex_W01.S_Yordle.dds",
			"name": "Personal Space",
			"variables": [
				{
					"name": "ShieldAmount",
					"value": [
						400,
						550,
						700,
						900,
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
			"armor": 50,
			"attackSpeed": 0.6000000238418579,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 50,
			"hp": 850,
			"initialMana": 50,
			"magicResist": 50,
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
			"desc": "Vi shields herself for @ModifiedShield@ damage and deals @ModifiedDamage@ magic damage to her target and enemies behind it.<br><br>On her 2nd cast, she also dashes through her target.<br><br>On her 3rd cast, she instead throws her target into the air and slams them back to the ground, dealing @ModifiedDamageFinal@ in a circle around her target.",
			"icon": "ASSETS/Characters/TFT6_Vi/HUD/Icons2D/TFT6_ViE.TFT_Set6.dds",
			"name": "Piltover Pulverizer",
			"variables": [
				{
					"name": "Damage",
					"value": [
						50,
						150,
						225,
						450,
						1000,
						1250,
						1500
					]
				},
				{
					"name": "AoEHexRadius",
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
					"name": "DamageFinal",
					"value": [
						0,
						300,
						450,
						900,
						0,
						0,
						0
					]
				},
				{
					"name": "Shield",
					"value": [
						0,
						225,
						325,
						750,
						0,
						0,
						0
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
				}
			]
		},
		"apiName": "TFT6b_Vi",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6b_Vi.dds",
		"name": "Vi",
		"stats": {
			"armor": 50,
			"attackSpeed": 0.699999988079071,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 900,
			"initialMana": 0,
			"magicResist": 50,
			"mana": 40,
			"range": 1
		},
		"traits": [
			"Enforcer",
			"Rival",
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
						360,
						420,
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
			"mana": 140,
			"range": 4
		},
		"traits": [
			"Chemtech",
			"Arcanist"
		]
	},
	{
		"ability": {
			"desc": "Passive: Warwick's Attacks deal an additional @ModifiedPercentHealth@ of his target's current Health as bonus magic damage, and heal him for @ModifiedHealAmount@ Health.",
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
			"desc": "Zac stretches his arms up to 3 hexes to pull the 2 most distant enemies towards him, dealing @ModifiedDamage@ magic damage. During this time, Zac gains @DamageReduction@% damage reduction.",
			"icon": "ASSETS/Characters/Zac/HUD/Icons2D/ZacQ.dds",
			"name": "Yoink!",
			"variables": [
				{
					"name": "Damage",
					"value": [
						50,
						300,
						400,
						600,
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
				},
				{
					"name": "DamageReduction",
					"value": [
						75,
						75,
						75,
						75,
						75,
						75,
						75
					]
				}
			]
		},
		"apiName": "TFT6_Zac",
		"cost": 3,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Zac.TFT_Set6_Stage2.dds",
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
			"desc": "Zeri charges herself up with electricity for @Duration@ seconds. While electrified, she aims at the farthest enemy, her attacks pierce, and she dashes after every shot.<br><br>Passive: Zeri's Basic Attacks fire @NumBullets@ bullets, each dealing <scaleAD>@TooltipDamage@</scaleAD> physical damage (@PercentAD*100@% of her Attack Damage %i:scaleAD%) and @ModifiedBonusOnHit@ bonus magic damage. <br><br><TFTDebonairVIP>VIP Bonus: Zeri's electrified duration lasts until the end of combat. </TFTDebonairVIP>",
			"icon": "ASSETS/Characters/Zeri/HUD/Icons2D/ZeriR.Zeri.dds",
			"name": "Lightning Crash",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						200,
						350,
						5000,
						500,
						625,
						750
					]
				},
				{
					"name": "NumBullets",
					"value": [
						5,
						5,
						5,
						30,
						5,
						5,
						5
					]
				},
				{
					"name": "PercentAD",
					"value": [
						0.1599999964237213,
						0.1599999964237213,
						0.1599999964237213,
						0.1599999964237213,
						0.1599999964237213,
						0.1599999964237213,
						0.1599999964237213
					]
				},
				{
					"name": "BonusOnHit",
					"value": [
						0,
						11,
						22,
						55,
						0,
						0,
						0
					]
				},
				{
					"name": "Duration",
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
					"name": "CritBoost",
					"value": [
						0.25,
						0.25,
						0.4000000059604645,
						1,
						0.25,
						0.25,
						0.25
					]
				},
				{
					"name": "CritDuration",
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
					"name": "VIPTotalDuration",
					"value": [
						60,
						60,
						60,
						60,
						60,
						60,
						60
					]
				}
			]
		},
		"apiName": "TFT6_Zeri",
		"cost": 8,
		"icon": "ASSETS/UX/TFT/ChampionSplashes/TFT6_Zeri.TFT_Set6_Stage2.dds",
		"name": "Zeri",
		"stats": {
			"armor": 30,
			"attackSpeed": 0.800000011920929,
			"critChance": 0.25,
			"critMultiplier": 1.2999999523162842,
			"damage": 80,
			"hp": 850,
			"initialMana": 0,
			"magicResist": 30,
			"mana": 60,
			"range": 11
		},
		"traits": [
			"Debonair",
			"Sniper"
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
						300,
						400,
						550,
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
			"damage": 55,
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
			"desc": "Zyra summons vines in the row with the most enemies, dealing @ModifiedDamage@ magic damage and stunning them for @StunDuration@ seconds.",
			"icon": "ASSETS/Characters/Zyra/HUD/Icons2D/ZyraQ.dds",
			"name": "Grasping Spines",
			"variables": [
				{
					"name": "Damage",
					"value": [
						0,
						325,
						450,
						675,
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
	}
]