import type { ItemData } from '#/game/types'

export const items: ItemData[] = [
	{
		"desc": "Grants %i:scaleAP% @AP@ bonus Ability Power (including components).",
		"effects": {
			"AP": 75
		},
		"from": [
			3,
			3
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Rabadons_Deathcap.dds",
		"id": 33,
		"name": "Rabadon's Deathcap",
		"unique": false
	},
	{
		"desc": "Grants @CritChance@% Critical Strike Chance (including components) and @BonusCritDamage@% Critical Strike Damage. Each point of Critical Strike Chance above 100% becomes +@BonusCritDmgPerCritAbove100@% Critical Strike Damage. <br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AD": 10,
			"CritChance": 75,
			"{45c7ed6b}": 1,
			"{d34ac151}": 10
		},
		"from": [
			1,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Infinity_Edge.dds",
		"id": 19,
		"name": "Infinity Edge",
		"unique": true
	},
	{
		"desc": "Reduces the Attack Speed of enemies within @HexRadius@ hexes by @AttackSpeedSlow@%.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Armor": 20,
			"AttackSpeedSlow": 35,
			"Mana": 15,
			"{5cc52ba8}": 2
		},
		"from": [
			4,
			5
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Frozen_Heart.dds",
		"id": 45,
		"name": "Frozen Heart",
		"unique": true
	},
	{
		"desc": "The holder gains the Enforcer trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Enforcer.TFT_Set6.dds",
		"id": 2194,
		"name": "Enforcer Emblem",
		"unique": true
	},
	{
		"desc": "When combat begins, the holder shoots a beam straight ahead that delays affected enemies' first cast, increasing their max Mana by @CostIncrease@% until they cast.<br><br><tftitemrules>[Unique - only one per champion]</tftitemrules>",
		"effects": {
			"Armor": 20,
			"{4516a18d}": 60,
			"{a861afa0}": 35,
			"{c4b5579c}": 15
		},
		"from": [
			5,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Shroud_of_Stillness.dds",
		"id": 59,
		"name": "Shroud of Stillness",
		"unique": true
	},
	{
		"desc": "Every @HealTickRate@ seconds, the holder radiates an aura to allies within @HexRadius@ hex, healing them for @MissingHealthHeal@% of their missing Health. Affected allies take @AoEDamageReduction@% reduced damage from multi-target abilities and attacks for @HealTickRate@ seconds.",
		"effects": {
			"Health": 150,
			"Mana": 15,
			"MaxHeal": 1000,
			"{033de552}": 25,
			"{5cc52ba8}": 1,
			"{7b6cc2f7}": 18,
			"{c9f222c0}": 5
		},
		"from": [
			4,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Redemption.dds",
		"id": 47,
		"name": "Redemption",
		"unique": false
	},
	{
		"desc": "When combat begins, the holder summons a whirlwind on the opposite side of the arena that removes the closest enemy from combat for @BanishDuration@ seconds. Ignores crowd control immunity.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Health": 150,
			"MagicResist": 20,
			"{510fdb6a}": 5
		},
		"from": [
			6,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Zephyr.dds",
		"id": 67,
		"name": "Zephyr",
		"unique": true
	},
	{
		"desc": "The holder gains the Clockwork trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Clockwork.TFT_Set6.dds",
		"id": 2191,
		"name": "Clockwork Emblem",
		"unique": true
	},
	{
		"desc": "When combat begins, the holder and all allies within @HexRange@ hexes in the same row gain %i:scaleAS% @AttackSpeed@% Attack Speed for the rest of combat.",
		"effects": {
			"AD": 10,
			"AttackSpeed": 30,
			"Health": 150,
			"{9b1e8f37}": 1
		},
		"from": [
			1,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Zekes_Herald.dds",
		"id": 17,
		"name": "Zeke's Herald",
		"unique": false
	},
	{
		"desc": "At the beginning of each planning phase, the holder equips 2 temporary items. Temporary items increase in power based on your player level.<br><br><tftitemrules>[Consumes 3 item slots.]</tftitemrules>",
		"effects": {
			"CritChance": 15,
			"{c4b5579c}": 15
		},
		"from": [
			9,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Thieves_Gloves.dds",
		"id": 99,
		"name": "Thief's Gloves",
		"unique": false
	},
	{
		"desc": "Attacks grant +@AttackSpeedPerStack@% bonus Attack Speed for the rest of combat. This effect can stack any number of times.",
		"effects": {
			"AP": 10,
			"AS": 10,
			"AttackSpeedPerStack": 6
		},
		"from": [
			2,
			3
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Guinsoos_Rageblade.dds",
		"id": 23,
		"name": "Guinsoo's Rageblade",
		"unique": false
	},
	{
		"desc": "Enemies within @HexRange@ hexes have their Magic Resist reduced by @MRShred@%. When they cast an Ability, they are zapped taking magic damage equal to @ManaRatio@% of their maximum Mana.",
		"effects": {
			"AP": 10,
			"Damage": 250,
			"MagicResist": 20,
			"{9b1e8f37}": 2,
			"{df6f64b9}": 200,
			"{fe079f34}": 50
		},
		"from": [
			3,
			6
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Ionic_Spark.dds",
		"id": 36,
		"name": "Ionic Spark",
		"unique": false
	},
	{
		"desc": "Grants %i:scaleMR% @MagicResist@ bonus Magic Resist (including components). On being hit by magic or true damage from a casted Ability, launch a fireball at the Ability's caster that deals magic damage equal to @PercentHealthDamage@% of their maximum Health (@ICD@ second cooldown).",
		"effects": {
			"ICD": 0.5,
			"MagicResist": 200,
			"PercentHealthDamage": 18,
			"{fa1ef605}": 160
		},
		"from": [
			6,
			6
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Dragons_Claw.dds",
		"id": 66,
		"name": "Dragon's Claw",
		"unique": false
	},
	{
		"desc": "When combat begins, the holder and all allies within @HexRange@ hex(es) in the same row gain a shield that blocks the damage and effects of the first enemy Ability, up to 600 damage. <br>",
		"effects": {
			"Health": 150,
			"StunDuration": 4,
			"{9b1e8f37}": 1,
			"{c3360f16}": 600,
			"{c4b5579c}": 15
		},
		"from": [
			7,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Trap_Claw.dds",
		"id": 79,
		"name": "Banshee's Claw",
		"unique": false
	},
	{
		"desc": "The holder gains the Mercenary trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Mercenary.TFT_Set6.dds",
		"id": 2192,
		"name": "Mercenary Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Bodyguard trait.<br><br><tftitemrules>[Unique - only 1 per champion <br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Bodyguard.TFT_Set6.dds",
		"id": 58,
		"name": "Bodyguard Emblem",
		"unique": true
	},
	{
		"desc": "%i:scaleArmor% +@Armor@ Armor",
		"effects": {
			"Armor": 20
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Chain_Vest.dds",
		"id": 5,
		"name": "Chain Vest",
		"unique": false
	},
	{
		"desc": "%i:scaleAD% +@AD@ Attack Damage",
		"effects": {
			"AD": 10
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/BF_Sword.dds",
		"id": 1,
		"name": "B.F. Sword",
		"unique": false
	},
	{
		"desc": "Prevents the holder's first death, placing them in stasis instead. After @StasisDuration@ seconds, they return with @HealthRestore@ Health and shed all negative effects.<br><br><tftitemrules>[Unique - Only One Per Champion]</tftitemrules>",
		"effects": {
			"AD": 10,
			"Armor": 20,
			"HealthRestore": 400,
			"{c425872e}": 2
		},
		"from": [
			1,
			5
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Guardian_Angel.dds",
		"id": 15,
		"name": "Guardian Angel",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleArmor% @ArmorPerEnemy@ Armor and %i:scaleMR% @MRPerEnemy@ Magic Resist for each enemy targeting them.",
		"effects": {
			"Armor": 20,
			"MagicResist": 20,
			"{7ba8c0e3}": 18,
			"{7c694b41}": 18
		},
		"from": [
			5,
			6
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Gargoyle_Stoneplate.dds",
		"id": 56,
		"name": "Gargoyle Stoneplate",
		"unique": false
	},
	{
		"desc": "Grants %i:scaleArmor% @Armor@ bonus Armor (including components). Negates bonus damage from incoming critical strikes. On being hit by an attack, deal @1StarAoEDamage@/@2StarAoEDamage@/@3StarAoEDamage@ %i:star% magic damage to all nearby enemies (once every @ICD@ seconds).",
		"effects": {
			"Armor": 70,
			"ICD": 2.5,
			"{156febb8}": 120,
			"{1ee760be}": 60,
			"{6688a0d5}": 100,
			"{a3b999e9}": 80,
			"{b5c2a66b}": 200
		},
		"from": [
			5,
			5
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Bramble_Vest.dds",
		"id": 55,
		"name": "Bramble Vest",
		"unique": false
	},
	{
		"desc": "%i:scaleArmor% +@Armor@ Armor",
		"effects": {
			"Armor": 20
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Chain_Vest.dds",
		"id": 5,
		"name": "Chain Vest",
		"unique": false
	},
	{
		"desc": "The holder gains the Protector trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Protector.TFT_Set6.dds",
		"id": 2196,
		"name": "Protector Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Innovator trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Innovator.TFT_Set6.dds",
		"id": 2198,
		"name": "Innovator Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Scholar trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Scholar.TFT_Set6.dds",
		"id": 2200,
		"name": "Scholar Emblem",
		"unique": true
	},
	{
		"desc": "%i:scaleAS% +@AS@ Attack Speed",
		"effects": {
			"AS": 10
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Recurve_Bow.dds",
		"id": 2,
		"name": "Recurve Bow",
		"unique": false
	},
	{
		"desc": "The holder's Abilities and attacks do @SmallBonusPct@% bonus damage. If the target has more than @HealthThreshold@ maximum Health, the bonus increases to @LargeBonusPct@%.",
		"effects": {
			"AD": 10,
			"AS": 10,
			"HealthThreshold": 1800,
			"{b8ae7546}": 60,
			"{deada01e}": 20
		},
		"from": [
			1,
			2
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Giant_Slayer.dds",
		"id": 12,
		"name": "Giant Slayer",
		"unique": false
	},
	{
		"desc": "Every @ICD@ seconds, a random enemy within @HexRange@ hexes is burned for @BurnPercent@% of their maximum Health as true damage over @BurnDuration@ seconds. Any healing they receive is reduced by @GrievousWoundsPercent@%.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Armor": 20,
			"Health": 150,
			"ICD": 2.5,
			"MonsterCap": 100,
			"{2161bfa2}": 50,
			"{57706a69}": 20,
			"{97e52ce8}": 8,
			"{9b1e8f37}": 2
		},
		"from": [
			5,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Sunfire_Cape.dds",
		"id": 57,
		"name": "Sunfire Cape",
		"unique": true
	},
	{
		"desc": "The holder gains the Imperial trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AD": 10
		},
		"from": [
			8,
			1
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Imperial.TFT_Set6.dds",
		"id": 18,
		"name": "Imperial Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains both of the following:<li>+@BaseAD@ Attack Damage and +@BaseSP@ Ability Power.</li> <li>Attacks and Abilities heal for @BaseHeal@% of damage dealt.</li><br><br>At the beginning of each planning phase, one of these buffs is increased to @TooltipBonus@(%).<br>",
		"effects": {
			"BaseHeal": 10,
			"BonusAD": 20,
			"CritChance": 15,
			"Mana": 15,
			"{19a89153}": 10,
			"{41cb628d}": 10,
			"{a60806db}": 66.66699981689453,
			"{ae49cc70}": 20,
			"{c0c9af7f}": 20,
			"{f2474447}": 30
		},
		"from": [
			4,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Hand_of_Justice.dds",
		"id": 49,
		"name": "Hand Of Justice",
		"unique": false
	},
	{
		"desc": "Prevents the holder's first death, placing them in stasis instead. After @StasisDuration@ seconds, they return with @HealthRestore@ Health and shed all negative effects.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AD": 10,
			"Armor": 20,
			"HealthRestore": 400,
			"{c425872e}": 2
		},
		"from": [
			1,
			5
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Guardian_Angel.dds",
		"id": 15,
		"name": "Guardian Angel",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleMana% @Mana@ Starting Mana (including components). After casting their Ability, the holder gains %i:scaleMana% @ManaRestore@ mana.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Mana": 50,
			"ManaRestore": 20,
			"{71bc3700}": 200,
			"{af1d4d88}": 20
		},
		"from": [
			4,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Blue_Buff.dds",
		"id": 44,
		"name": "Blue Buff",
		"unique": true
	},
	{
		"desc": "%i:scaleMana% +@Mana@ Mana",
		"effects": {
			"Mana": 15
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Tear_of_the_Goddess.dds",
		"id": 4,
		"name": "Tear of the Goddess",
		"unique": false
	},
	{
		"desc": "%i:scaleMR% +@MagicResist@ Magic Resist",
		"effects": {
			"MagicResist": 20
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Negatron_Cloak.dds",
		"id": 6,
		"name": "Negatron Cloak",
		"unique": false
	},
	{
		"desc": "The holder gains the Bruiser trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Bruiser.TFT_Set6.dds",
		"id": 2197,
		"name": "Bruiser Emblem",
		"unique": true
	},
	{
		"desc": "When the holder attacks or takes damage, they gain @StackingAD@ Attack Damage and Ability Power. <br><br>This stacks up to @StackCap@ times, at which point the holder gains @BonusResistsAtStackCap@ Armor and Magic Resist.",
		"effects": {
			"AS": 10,
			"Armor": 20,
			"{9396f00d}": 25,
			"{b3b8f644}": 2,
			"{b55019fa}": 25,
			"{cb9689ca}": 2
		},
		"from": [
			5,
			2
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Titans_Resolve.dds",
		"id": 25,
		"name": "Titan's Resolve",
		"unique": false
	},
	{
		"desc": "The holder gains the Socialite trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Socialite.TFT_Set6.dds",
		"id": 2193,
		"name": "Socialite Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Mutant trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"MagicResist": 20
		},
		"from": [
			6,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Mutant.TFT_Set6.dds",
		"id": 2190,
		"name": "Mutant Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleAD% @AD@ Attack Damage. The holder's attacks fire a bolt at another nearby enemy, dealing @MultiplierForDamage@% of the holder's Attack Damage as physical damage.",
		"effects": {
			"AD": 10,
			"AS": 10,
			"AdditionalTargets": 1,
			"MagicResist": 20,
			"{276ba2c8}": 75
		},
		"from": [
			6,
			2
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Runaans_Hurricane.dds",
		"id": 26,
		"name": "Runaan's Hurricane",
		"unique": false
	},
	{
		"desc": "+@CritChance@ Critical Strike Chance<br>+@DodgeChance@ Dodge Chance",
		"effects": {
			"CritChance": 5,
			"{c4b5579c}": 10
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Sparring_Gloves.dds",
		"id": 9,
		"name": "Sparring Gloves",
		"unique": false
	},
	{
		"desc": "Physical damage heals the holder for @Lifesteal@% of the damage dealt. Upon falling below @HealthThreshold@% Health, the holder gains a @ShieldHealthPercent@% maximum Health shield that lasts up to @ShieldDuration@ seconds.",
		"effects": {
			"AD": 10,
			"HealthThreshold": 40,
			"LifeSteal": 33,
			"MagicResist": 20,
			"ShieldDuration": 5,
			"{0034a6ef}": 30
		},
		"from": [
			1,
			6
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Bloodthirster.dds",
		"id": 16,
		"name": "Bloodthirster",
		"unique": false
	},
	{
		"desc": "During combat, the holder gains %i:scaleAP% @APPerInterval@ Ability Power every @IntervalSeconds@ seconds.",
		"effects": {
			"AP": 10,
			"Mana": 15,
			"{5deb4eb2}": 25,
			"{a7db7345}": 5
		},
		"from": [
			3,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/TFT_Item_ArchangelsStaff.TFT_Set5.dds",
		"id": 34,
		"name": "Archangel's Staff",
		"unique": false
	},
	{
		"desc": "The holder gains the Scrap trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Scrap.TFT_Set6.dds",
		"id": 2195,
		"name": "Scrap Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Arcanist trait.<br><br><tftitemrules>[Unique - only 1 per champion</tftitemrules>",
		"effects": {
			"AP": 10
		},
		"from": [
			3,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Arcanist.TFT_Set6.dds",
		"id": 38,
		"name": "Arcanist Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Challenger trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AS": 10
		},
		"from": [
			2,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Challenger.TFT_Set6.dds",
		"id": 28,
		"name": "Challenger Emblem",
		"unique": true
	},
	{
		"desc": "At the start of combat, the holder taunts enemies within @HexRadius@ hexes. <br><br>When the holder dies, a Voidspawn arises taunting nearby enemies. Voidspawns that arise from summoned units are @SummonedStatReduction@% effective.",
		"effects": {
			"AS": 10,
			"Health": 150,
			"{5cc52ba8}": 4,
			"{7ff4f3b6}": 25
		},
		"from": [
			2,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/ZZRot_Portal.dds",
		"id": 27,
		"name": "Zz'Rot Portal",
		"unique": false
	},
	{
		"desc": "The holder's attacks restore %i:scaleMana% @FlatManaRestore@ additional Mana. ",
		"effects": {
			"AD": 10,
			"Mana": 15,
			"{4b9a3b61}": 8
		},
		"from": [
			1,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Spear_of_Shojin.dds",
		"id": 14,
		"name": "Spear of Shojin",
		"unique": false
	},
	{
		"desc": "It must do <i>something</i>...",
		"effects": {
			"{fe9818ef}": 5
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Spatula.dds",
		"id": 8,
		"name": "Spatula",
		"unique": false
	},
	{
		"desc": "The holder gains the Syndicate trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Armor": 20
		},
		"from": [
			5,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Syndicate.TFT_Set6.dds",
		"id": 68,
		"name": "Syndicate Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains the Sniper trait.<br><br><tftitemrules>[Unique - only 1 per champion<br>Elusive - cannot be crafted.]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Sniper.TFT_Set6.dds",
		"id": 2199,
		"name": "Sniper Emblem",
		"unique": true
	},
	{
		"desc": "When combat begins, the holder and all allies within @HexRange@ hexes in the same row gain a shield that blocks @1StarShieldValue@/@2StarShieldValue@/@3StarShieldValue@ %i:star% damage for @ShieldDuration@ seconds.",
		"effects": {
			"AP": 10,
			"Armor": 20,
			"ShieldDuration": 8,
			"{0d46330d}": 350,
			"{6fb9af6a}": 300,
			"{829e6cec}": 400,
			"{9b1e8f37}": 2,
			"{c78af25f}": 800
		},
		"from": [
			3,
			5
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Locket_of_the_Iron_Solari.dds",
		"id": 35,
		"name": "Locket of the Iron Solari",
		"unique": false
	},
	{
		"desc": "When the holder deals magic or true damage with their Ability, they burn the target, dealing @BurnPercent@% of the target's maximum Health as true damage over @BurnDuration@ seconds, and reducing healing by @GrievousWoundsPercent@% for the duration of the burn.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AP": 10,
			"Health": 150,
			"MonsterCap": 100,
			"TicksPerSecond": 1,
			"{2161bfa2}": 50,
			"{57706a69}": 25,
			"{97e52ce8}": 10
		},
		"from": [
			3,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Morellonomicon.dds",
		"id": 37,
		"name": "Morellonomicon",
		"unique": true
	},
	{
		"desc": "Increases the holder's Attack Range by @HexRangeIncrease@ hex and grants %i:scaleAS% @TooltipBonusAS@% bonus Attack Speed (including components). The holder's attacks can no longer miss.",
		"effects": {
			"AS": 50,
			"{16394c87}": 1,
			"{5100c273}": 50,
			"{9f5117db}": 100
		},
		"from": [
			2,
			2
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Rapid_Fire_Cannon.dds",
		"id": 22,
		"name": "Rapid Firecannon",
		"unique": false
	},
	{
		"desc": "%i:scaleAD% +@AD@ Attack Damage",
		"effects": {
			"AD": 10
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/BF_Sword.dds",
		"id": 1,
		"name": "B.F. Sword",
		"unique": false
	},
	{
		"desc": "When the holder inflicts a critical hit, the target's Armor is reduced by @ArmorReductionPercent@% for @ArmorBreakDuration@ seconds. This effect does not stack.<br><br><tftitemrules>[Unique - only one per champion]</tftitemrules>",
		"effects": {
			"AS": 10,
			"CritChance": 15,
			"{5079c7a2}": 70,
			"{cc9fefa7}": 5
		},
		"from": [
			2,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Last_Whisper.dds",
		"id": 29,
		"name": "Last Whisper",
		"unique": true
	},
	{
		"desc": "The holder gains the Assassin trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"CritChance": 10,
			"{c4b5579c}": 5
		},
		"from": [
			9,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Assassin.TFT_Set6.dds",
		"id": 89,
		"name": "Assassin Emblem",
		"unique": true
	},
	{
		"desc": "The holder's magic and true damage from their Ability can critically strike. The holder gains @CritDamageAmp@% bonus Critical Strike Damage and %i:scaleAP% @TooltipBonusAP@ bonus Ability Power.",
		"effects": {
			"AP": 20,
			"CritChance": 15,
			"{353ede36}": 30,
			"{5200c406}": 10
		},
		"from": [
			3,
			9
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Jeweled_Guantlet.dds",
		"id": 39,
		"name": "Jeweled Gauntlet",
		"unique": false
	},
	{
		"desc": "%i:scaleHealth% +@Health@ Health",
		"effects": {
			"Health": 150
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Gaints_Belt.dds",
		"id": 7,
		"name": "Giant's Belt",
		"unique": false
	},
	{
		"desc": "%i:scaleAP% +@AP@ Ability Power",
		"effects": {
			"AP": 10
		},
		"from": [],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Needlessly_Large_Rod.dds",
		"id": 3,
		"name": "Needlessly Large Rod",
		"unique": false
	},
	{
		"desc": "The holder gains the Academy trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Mana": 15
		},
		"from": [
			8,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Academy.TFT_Set6.dds",
		"id": 48,
		"name": "Academy Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleAS% @AS@% bonus Attack Speed. The holder is immune to crowd control in combat for @SpellShieldDuration@ seconds.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"AS": 20,
			"MagicResist": 20,
			"{a2b76524}": 15,
			"{c4b5579c}": 15
		},
		"from": [
			9,
			6
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Quicksilver.dds",
		"id": 69,
		"name": "Quicksilver",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleAD% @Tooltip1StarBonusAD@/@Tooltip2StarBonusAD@/@Tooltip3StarBonusAD@ %i:star% bonus Attack Damage (including components).",
		"effects": {
			"AD": 20,
			"{1b738810}": 80,
			"{82618485}": 55,
			"{8c7c8547}": 50,
			"{d4afa164}": 75,
			"{eb990bd7}": 125,
			"{edb2fb99}": 100,
			"{f924a46e}": 30
		},
		"from": [
			1,
			1
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Death_Blade.dds",
		"id": 11,
		"name": "Deathblade",
		"unique": false
	},
	{
		"desc": "When combat begins, the holder and all allies within @HexRange@ hex in the same row gain %i:scaleAP% @BonusAP@ Ability Power for the rest of combat.",
		"effects": {
			"MagicResist": 20,
			"Mana": 15,
			"ManaRestore": 10,
			"{9b1e8f37}": 1,
			"{9fd37c1c}": 20,
			"{d49caf5d}": 30
		},
		"from": [
			6,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Chalice_of_Power.dds",
		"id": 46,
		"name": "Chalice of Power",
		"unique": false
	},
	{
		"desc": "Grants %i:scaleHealth% @Health@ bonus Health (including components).",
		"effects": {
			"Health": 1000
		},
		"from": [
			7,
			7
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard/Warmogs_Armor.dds",
		"id": 77,
		"name": "Warmog's Armor",
		"unique": false
	},
	{
		"desc": "The holder gains the Chemtech trait.<br><br><tftitemrules>[Unique - only 1 per champion]</tftitemrules>",
		"effects": {
			"Health": 150
		},
		"from": [
			7,
			8
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Spatula/Set6/Chemtech.TFT_Set6.dds",
		"id": 78,
		"name": "Chemtech Emblem",
		"unique": true
	},
	{
		"desc": "The holder gains %i:scaleAS% @BonusAS@% bonus Attack Speed. Every 3rd attack from the holder unleashes a chain lightning that bounces to @1StarBounces@ enemies, dealing @Damage@ magic damage and reducing their Magic Resist by @MRShred@% for @MRShredDuration@ seconds. ",
		"effects": {
			"AS": 10,
			"BonusAS": 15,
			"Damage": 70,
			"Mana": 15,
			"{12a15e9e}": 4,
			"{15144cec}": 4,
			"{440f813d}": 4,
			"{79e2ec7b}": 4,
			"{b223097c}": 5,
			"{fe079f34}": 50
		},
		"from": [
			2,
			4
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Statikk_Shiv.dds",
		"id": 24,
		"name": "Statikk Shiv",
		"unique": false
	},
	{
		"desc": "The holder's magic and true damage from Abilities heal them for @OmniVamp@% of the damage dealt. The holder also heals their lowest Health ally for the same amount.",
		"effects": {
			"AD": 10,
			"AP": 10,
			"ShieldMax": 400,
			"{ad16f688}": 33
		},
		"from": [
			1,
			3
		],
		"icon": "ASSETS/Maps/Particles/TFT/Item_Icons/Standard_New/Hextech_Gunblade.dds",
		"id": 13,
		"name": "Hextech Gunblade",
		"unique": false
	}
]