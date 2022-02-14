const LOAD_PBE = true
const MAX_STAR_LEVEL = 3

import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

import { BonusKey } from '../src/helpers/types.js'
import type { ChampionData, ChampionSpellData, ItemData, TraitData } from '../src/helpers/types.js'
import { ItemKey } from '../src/data/set6/items.js'

const baseURL = `https://raw.communitydragon.org/${LOAD_PBE ? 'pbe' : 'latest'}`
const url = `${baseURL}/cdragon/tft/en_us.json`
console.log(url)
const response = await fetch(url)
if (!response.ok) {
	throw response
}
const responseJSON = await response.json() as Record<string, any>
const currentSetNumber = Object.keys(responseJSON.sets).reduce((previous, current) => Math.max(previous, parseInt(current, 10)), 0)
const { champions, traits } = (responseJSON as any).sets[currentSetNumber]

console.log('Loading set', currentSetNumber, 'from', LOAD_PBE ? 'PBE' : 'Live', '...', 'Units:', champions.length, 'Traits:', traits.length)

const itemData = responseJSON.items as Record<string, any>[]
const standardComponents = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const retiredItems = [15]
const spatulaItemKey = `/spatula/set${currentSetNumber}/`
const foundItemIDs: number[] = []
const currentItems = (itemData as ItemData[]).reverse().filter(item => {
	if (foundItemIDs.includes(item.id) || retiredItems.includes(item.id)) {
		return false
	}
	const name = (item.name as string).toLowerCase()
	if (name.startsWith('tft_')) {
		return false
	}
	const icon = (item.icon as string).toLowerCase()
	const from = item.from as number[]
	let isCurrentItem = false
	if (from.length) {
		if (from.includes(8) && !icon.includes(spatulaItemKey)) {
			return false
		}
		isCurrentItem = from.every(itemID => standardComponents.includes(itemID))
	} else {
		isCurrentItem = standardComponents.includes(item.id) || icon.includes(spatulaItemKey)
	}
	if (isCurrentItem) {
		foundItemIDs.push(item.id)
	}
	return isCurrentItem
})

const outputFolder = `src/data/set${currentSetNumber}/`

const unplayableNames = ['TFT5_EmblemArmoryKey', 'TFT6_MercenaryChest', 'TFT6_TheGoldenEgg']
const playableChampions = (champions as ChampionData[])
	.filter(champion => {
		if (unplayableNames.includes(champion.apiName)) {
			return false
		}
		if (!champion.icon) {
			if (champion.apiName !== 'TFT6_Annie') {
				console.log('No icon for champion, excluding.', champion)
			}
			return false
		}
		return true
	})
	.sort((a, b) => a.name.localeCompare(b.name))

type ChampionJSON = Record<string, Record<string, any>>
type ChampionJSONType = 'SpellObject' | 'TFTCharacterRecord'
interface ChampionJSONAttack {
	mAttackName?: string
	mAttackProbability?: number
	mAttackCastTime?: number
	mAttackDelayCastOffsetPercent?: number
	mAttackTotalTime?: number
}
interface ChampionJSONStats {
	PortraitIcon: string
	tier?: number
	mLinkedTraits?: {TraitData: string}[]
	baseStaticHPRegen: number
	baseCritChance: number
	critDamageMultiplier: number
	baseArmor: number
	attackRange: number
	attackSpeed: number
	baseDamage: number
	baseHP: number
	baseSpellBlock: number
	mInitialMana?: number
	primaryAbilityResource: {
		arBase?: number
	}
	baseMoveSpeed: number
	spellNames: string[]
	extraSpells?: string[]
	isSpawn?: true
	teamSize: number
	basicAttack?: ChampionJSONAttack
	extraAttacks?: ChampionJSONAttack[]
	critAttacks?: ChampionJSONAttack[]
}

interface ChampionJSONSpellAttack {
	missileSpeed?: number
	mMissileSpec?: {
		mMissileWidth: number
		movementComponent: {
			mSpeed: number
		}
	}
}

interface ChampionJSONSpell {
	mCastTime?: number
	mDataValues?: {
		mName: string
		mValues?: number[]
	}[]
	mCantCancelWhileWindingUp?: true
	missileSpeed?: number
	mMissileSpec?: {
		mMissileWidth: number
		movementComponent: {
			mTravelTime?: number
			mSpeed?: number
			mTracksTarget?: false
			mAcceleration?: number
			mInitialSpeed?: number
			mMaxSpeed?: number
		}
	}
	cantCastWhileRooted?: true
}
function getByType(type: ChampionJSONType, json: ChampionJSON) {
	for (const key in json) {
		const entry = json[key]
		if (entry.__type === type) {
			return entry
		}
	}
}
function getCharacterRecord(json: ChampionJSON) {
	return getByType('TFTCharacterRecord', json) as ChampionJSONStats
}
function getByScriptName(name: string, json: ChampionJSON) {
	for (const key in json) {
		const entry = json[key]
		if (entry.mScriptName === name) {
			return entry
		}
	}
}
function getSpell(name: string, json: ChampionJSON): ChampionJSONSpell | undefined {
	const spellContainer = getByScriptName(name, json)
	if (!spellContainer) {
		// console.log('No spell', name)
		return undefined
	}
	for (const key in spellContainer) {
		if (key !== 'mScriptName' && key !== 'mSpell' && key !== 'mBuff' && key !== 'mScript' && key !== '__type') {
			console.log('Unknown spell key', key, name)
		}
	}
	return spellContainer.mSpell
}

const deleteNormalizations: Record<string, string[]> = {
	SpellDataResource: [ 'cooldownTime', 'mClientData', 'mAnimationName' ],
	TFTCharacterRecord: [ 'attackSpeedRatio', 'healthBarHeight', 'healthBarFullParallax', 'selectionRadius', 'selectionHeight', 'expGivenOnDeath', 'goldGivenOnDeath', 'mShopData' ],
}
const renameNormalizations: Record<string, Record<string, string>> = {
	TFTCharacterRecord: {
		'{e1562ee7}': 'isSpawn',
		'{8d30a918}': 'teamSize',
	},
}
const renameTraits: Record<string, string> = {
	'{e41d146c}': 'TFT6_Arcanist',
	'{568f4f5c}': 'TFT6_Assassin',
	'{161a5685}': 'TFT6_Syndicate',
	'{b7403726}': 'TFT6_Bodyguard',
	'{dbb82b57}': 'TFT6_Bruiser',
	'{d392bf9c}': 'TFT6_Challenger',
	'{9450bffc}': 'TFT6_Chemtech',
	'{42e1fbf0}': 'TFT6_Clockwork',
	'{7b9d79e4}': 'TFT6_Colossus',
	'{32c4c2eb}': 'TFT6_Debonair',
	'{4f6f1a9d}': 'TFT6_Enchanter',
	'{0907e6f1}': 'TFT6_Enforcer',
	'{7a7004b4}': 'TFT6_Glutton',
	'{c51ec5be}': 'TFT6_Hextech',
	'{cac372b9}': 'TFT6_Innovator',
	'{407dfc2b}': 'TFT6_Mastermind',
	'{de28b133}': 'TFT6_Mercenary',
	'{5dfaa4aa}': 'TFT6_Mutant',
	'{e6a2f180}': 'TFT6_Rivals',
	'{bd30b5b9}': 'TFT6_Scholar',
	'{8b9f7f1a}': 'TFT6_Scrap',
	'{3e362a6e}': 'TFT6_Sniper',
	'{8e9af226}': 'TFT6_Socialite',
	'{b3cf9aef}': 'TFT6_Striker',
	'{69d4c0d0}': 'TFT6_Transformer',
	'{b669014b}': 'TFT6_Twinshot',
	'{7c57b394}': 'TFT6_Yordle',
	'{396d5623}': 'TFT6_YordleLord',
}

function reduceAttacks(attacks: ChampionJSONAttack[], json: ChampionJSON) {
	const attackSpeeds = attacks
		.map(attack => parseAttack(attack, json))
		.filter((speed): speed is number => speed != null)
	return attackSpeeds[0]
	// return attackSpeeds.length === 0 ? undefined : attackSpeeds.reduce((acc, value) => acc + value, 0) / attackSpeeds.length
}
function parseAttack(attack: ChampionJSONAttack, json: ChampionJSON) {
	const spell = getSpell(attack.mAttackName!, json)
	if (!spell) { return undefined }
	const attackSpell = spell as ChampionJSONSpellAttack
	const speed = attackSpell.mMissileSpec?.movementComponent.mSpeed ?? attackSpell.missileSpeed
	return speed
	// return {
	// 	probability: attack.mAttackProbability,
	// 	width: attackSpell.mMissileSpec?.mMissileWidth,
	// 	speed,
	// }
}

const championsPath = path.resolve(outputFolder, 'champion')
await fs.mkdir(championsPath, { recursive: true })
const outputChampions = await Promise.all(playableChampions.map(async champion => {
	const apiName = champion.apiName
	const pathName = champion.apiName.toLowerCase()
	const outputPath = path.resolve(championsPath, pathName + '.json')
	let json: ChampionJSON
	try {
		const raw = await fs.readFile(outputPath, 'utf8')
		json = JSON.parse(raw)
	} catch {
		const url = `${baseURL}/game/data/characters/${pathName}/${pathName}.bin.json`
		console.log('\nLoading champion', apiName, url)
		const response = await fetch(url)
		if (!response.ok) {
			throw response
		}
		json = await response.json() as ChampionJSON
		for (const rootKey in json) { // Remove keys irrelevant to simulation
			const entry = json[rootKey]
			if (entry.__type === 'SkinCharacterMetaDataProperties') {
				delete json[rootKey]
				continue
			}
			const deleting = deleteNormalizations[entry.__type]
			if (deleting != null) {
				for (const deleteKey of deleting) {
					delete json[rootKey][deleteKey]
				}
			}
			const renaming = renameNormalizations[entry.__type]
			if (renaming != null) {
				for (const renameKey in renaming) {
					const value = json[rootKey][renameKey]
					delete json[rootKey][renameKey]
					json[rootKey][renaming[renameKey]] = value
				}
			}
			if (entry.__type === 'TFTCharacterRecord') {
				const stats = entry as ChampionJSONStats
				stats.mLinkedTraits?.forEach(traitEntry => {
					const rawTrait = traitEntry.TraitData
					traitEntry.TraitData = renameTraits[rawTrait]
				})
			}
		}
		fs.writeFile(outputPath, JSON.stringify(json, undefined, '\t'))
	}

	const characterRecord = getCharacterRecord(json)
	if (characterRecord.baseStaticHPRegen !== 0) {
		console.log('ERR HP Regen', apiName, characterRecord.baseStaticHPRegen)
	}
	let totalMana = characterRecord.primaryAbilityResource.arBase
	let initialMana = characterRecord.mInitialMana ?? 0
	if (totalMana == null) {
		totalMana = initialMana
		initialMana = 0
	}
	const stats = {
		armor: characterRecord.baseArmor,
		attackSpeed: characterRecord.attackSpeed,
		critChance: characterRecord.baseCritChance,
		critMultiplier: characterRecord.critDamageMultiplier,
		damage: characterRecord.baseDamage,
		hp: characterRecord.baseHP,
		initialMana,
		magicResist: characterRecord.baseSpellBlock,
		mana: totalMana,
		moveSpeed: characterRecord.baseMoveSpeed,
		range: Math.floor(characterRecord.attackRange / 180),
	}
	const spellNames = characterRecord.spellNames
	if (characterRecord.extraSpells) {
		spellNames.push(...characterRecord.extraSpells)
	}
	// if (apiName === 'TFT6_Gnar') {
	// }
	let isFirstSpell = true
	const spells = spellNames
		.filter(name => name && name !== 'BaseSpell')
		.map(spellName => {
			const spell = getSpell(spellName, json)
			return spell ? [spellName, spell] as [string, ChampionJSONSpell] : undefined
		})
		.filter((spellData): spellData is [string, ChampionJSONSpell] => {
			if (!spellData) {
				return false
			}
			if (isFirstSpell) {
				isFirstSpell = false
				if (spellData[1]?.mDataValues == null) {
					const spellName = spellData[0]
					if (spellName !== 'TFT6_JayceR') {
						console.log('!mDataValues', spellName)
					}
					return false
				}
			}
			return true
		})
		.map(([spellName, spellData]) => {
			const missileSpec = spellData.mMissileSpec
			const missileMovement = missileSpec?.movementComponent
			// const variables: {name: string, values: number[]}[] = []
			const variables: Record<string, number[]> = {}
			if (spellData.mDataValues) {
				for (const dataValues of spellData.mDataValues) {
					if (dataValues.mValues) {
						// variables.push({ name: dataValues.mName, values: dataValues.mValues })
						variables[dataValues.mName] = dataValues.mValues.slice(0, MAX_STAR_LEVEL + 1)
					}
				}
			}
			const missileSpeed = spellData.missileSpeed
			const spell: ChampionSpellData = {
				name: spellName,
				castTime: spellData.mCastTime,
				missile: !missileSpec && missileSpeed == null
					? undefined
					: {
						width: missileSpec?.mMissileWidth,
						travelTime: missileMovement?.mTravelTime,
						speed: missileMovement?.mSpeed ?? missileMovement?.mInitialSpeed ?? missileSpeed,
						acceleration: missileMovement?.mAcceleration,
						speedMax: missileMovement?.mMaxSpeed,
						tracksTarget: missileMovement?.mTracksTarget !== false,
					},
				variables,
				cantCastWhileRooted: spellData.cantCastWhileRooted,
				uninterruptable: spellData.mCantCancelWhileWindingUp,
			}
			if (spellData.mCastTime == null) { //TODO verify these aren't supposed to instacast?
				console.log('!mCastTime', spellName)
			}
			// if (!spell.missile) { //TODO multipart spells (TFT6_ViktorE, TFT6_JhinR, etc)
			// if (spell.missile && spell.missile.speed == null && spell.missile.travelTime == null) {
			// 	console.log('!missile', spellName)
			// }
			return spell
		})
	if (!spells.length) {
		console.log('No spells for', apiName)
	} else if (spells.length > 1 && apiName !== 'TFT6_Jayce') {
		console.log('Multiple spells for', apiName, spells.map(spell => spell.name))
	}
	const basicAttacks = []
	if (characterRecord.basicAttack) {
		if (characterRecord.basicAttack.mAttackName == null) {
			characterRecord.basicAttack.mAttackName = `${apiName}BasicAttack`
		}
		basicAttacks.push(characterRecord.basicAttack)
	}
	if (characterRecord.extraAttacks) {
		basicAttacks.push(...characterRecord.extraAttacks)
	}
	const basicAttackMissileSpeed = reduceAttacks(basicAttacks.filter(attack => attack.mAttackName), json)
	const critAttacks = characterRecord.critAttacks
	const critAttackMissileSpeed = critAttacks ? reduceAttacks(critAttacks.filter(attack => attack.mAttackName), json) : undefined

	const isSpawn = characterRecord.isSpawn ?? false
	const traits = characterRecord.mLinkedTraits?.map(traitData => {
		if (traitData.TraitData.startsWith('{')) {
			console.log('ERR Unknown trait', apiName, traitData)
		}
		return traitData.TraitData.split('_')[1] //TODO
	}) ?? []
	return {
		spells,
		apiName,
		cost: characterRecord.tier,
		isSpawn,
		starLevel: apiName === 'TFT6_HexTechDragon' ? 3 : (apiName === 'TFT6_Tibbers' ? 2 : (apiName === 'TFT6_MalzaharVoidling' ? 1 : undefined)),
		teamSize: characterRecord.teamSize,
		icon: champion.icon,
		name: champion.name,
		basicAttackMissileSpeed,
		critAttackMissileSpeed,
		stats,
		traits,
	}
}))

const normalizeKeys: Record<string, BonusKey> = {
	AbilityPower: BonusKey.AbilityPower,
	SP: BonusKey.AbilityPower,
	BaseAP: BonusKey.AbilityPower,
	AttackDamage: BonusKey.AttackDamage,
	BaseAD: BonusKey.AttackDamage,
	ADBoost: `Bonus${BonusKey.AttackDamage}` as BonusKey,
	AttackSpeed: BonusKey.AttackSpeed,
	Health: BonusKey.Health,
	MagicResist: BonusKey.MagicResist,
	CritChanceAmpPercent: BonusKey.CritChance,
	CritDamageAmp: BonusKey.CritMultiplier,
	CritAmpPercent: BonusKey.CritMultiplier,
}

const stringIDReplacements: Record<string, string> = {
	'b4a90a5d': 'ProcChance',
	// '0acd95c2': 'ImperialBonusDamage',
	// 'f469c9e6': 'TyrantTooltipBonusDamage',
	'45564848': 'InnovationStarLevel', //TODO actual string
	'97ea7bfc': 'InnovatorStarLevelMultiplier', //TODO actual string
	'5263ba40': 'JinxEmpoweredAS',
	'2a50526a': 'JinxASDuration',
	'a859d7b0': 'ViManaReduction',
	'3b173c39': 'ViPunchRange', //TODO verify
	'471b1a16': 'TickRate',
	'd0539890': 'ManaPerTick',
	'6c155e99': 'OmnivampPercent',
	'f9f3a081': 'ManaPerSecond',
	// '65722d9c': 'ADAPBase',
	// '96ca059f': 'ADAPPerCast',
	// 'b3105623': 'ManaPerAllyAttack',
	'70ed38c6': 'DetainDuration',
	'd2b7f6f1': 'DetainCount', //TODO actual string
	'2f744e2b': 'TeamAbilityPower',
	'faa12163': 'ArcanistAbilityPower',
	'51aec5d2': 'BonusPerAugment',
	'cbb3a34f': 'AttackSpeedBonus',
	'ed1f9fc2': 'PercentManaReduction',
	'268f634e': 'CritAmpPercent',
	'9f2eb1e2': 'CritChanceAmpPercent',
	'5cc08b27': 'NumComponents',
	'94c6a08c': 'HPShieldAmount',
	'47343861': 'MagicResist',
	'98396b21': 'HealShieldBoost',
	'16394c87': BonusKey.HexRangeIncrease,
	'75994f47': 'PercentDamageIncrease',
	'17cfa971': 'BurstDuration',
	'867bc055': 'SyndicateIncrease',
	'45c7ed6b': 'BonusCritDmgPerCritAbove100',
	'd34ac151': 'BonusCritDamage',
	'5cc52ba8': 'HexRadius',
	'a861afa0': 'CostIncrease',
	'c4b5579c': 'DodgeChance',
	'c9f222c0': 'HealTickRate',
	'7b6cc2f7': 'MissingHealthHeal',
	'033de552': 'AoEDamageReduction',
	'510fdb6a': 'BanishDuration',
	'9b1e8f37': 'HexRange',
	'fe079f34': 'MRShred',
	'b223097c': 'MRShredDuration',
	'df6f64b9': 'ManaRatio',
	'c3360f16': 'DamageCap', //TODO actual name
	// 'c425872e': 'StasisDuration',
	'7c694b41': 'ArmorPerEnemy', //TODO monitor. unverifiable MRPerEnemy/ArmorPerEnemy
	'7ba8c0e3': 'MRPerEnemy', //TODO monitor. unverifiable MRPerEnemy/ArmorPerEnemy
	'1ee760be': '1StarAoEDamage',
	'a3b999e9': '2StarAoEDamage',
	'156febb8': '3StarAoEDamage',
	'b5c2a66b': '4StarAoEDamage',
	'6688a0d5': 'CritDamageBlock', //TODO actual name
	'deada01e': 'SmallBonusPct',
	'b8ae7546': 'LargeBonusPct',
	'ad16f688': 'OmniVamp',
	'12a15e9e': '1StarBounces', //TODO monitor. unverifiable 1StarBounces/2StarBounces/3StarBounces/4StarBounces
	'15144cec': '2StarBounces', //TODO monitor. unverifiable 1StarBounces/2StarBounces/3StarBounces/4StarBounces
	'440f813d': '3StarBounces', //TODO monitor. unverifiable 1StarBounces/2StarBounces/3StarBounces/4StarBounces
	'79e2ec7b': '4StarBounces', //TODO monitor. unverifiable 1StarBounces/2StarBounces/3StarBounces/4StarBounces
	'a2b76524': 'SpellShieldDuration',
	'f924a46e': '1StarAD', //TODO actual name
	'82618485': '2StarAD', //TODO actual name
	'1b738810': '3StarAD', //TODO actual name
	'eb990bd7': '4StarAD', //TODO verify
	'8c7c8547': 'Tooltip1StarBonusAD',
	'd4afa164': 'Tooltip2StarBonusAD',
	'edb2fb99': 'Tooltip3StarBonusAD',
	'd49caf5d': 'BonusAP',
	'57706a69': 'BurnPercent',
	'97e52ce8': 'BurnDuration',
	'2161bfa2': 'GrievousWoundsPercent',
	'b3b8f644': 'StackingAD', //TODO monitor. unverifiable StackingAP
	'cb9689ca': 'StackingAP', //TODO actual name, monitor. unverifiable StackingAD
	'9396f00d': 'StackCap', //TODO monitor. unverifiable BonusResistsAtStackCap
	'b55019fa': 'BonusResistsAtStackCap', //TODO monitor. unverifiable StackCap
	'276ba2c8': 'MultiplierForDamage',
	'0034a6ef': 'ShieldHealthPercent',
	'5deb4eb2': 'APPerInterval',
	'a7db7345': 'IntervalSeconds',
	'7ff4f3b6': 'SummonedStatReduction',
	'4b9a3b61': 'FlatManaRestore',
	'6fb9af6a': '1StarShieldValue',
	'0d46330d': '2StarShieldValue',
	'829e6cec': '3StarShieldValue',
	'c78af25f': '4StarShieldValue',
	'5100c273': 'TooltipBonusAS',
	'9f5117db': 'AttackAccuracy', //TODO actual name
	'5079c7a2': 'ArmorReductionPercent',
	'cc9fefa7': 'ArmorBreakDuration',
	'353ede36': 'CritDamageAmp',
	'5200c406': 'TooltipBonusAP',
	'19a89153': 'BaseAD', //TODO monitor. unverifiable BaseAP
	'41cb628d': 'BaseAP', //TODO monitor. unverifiable BaseAD
	'ae49cc70': 'AdditionalAD', //TODO actual name, monitor. unverifiable BonusAP
	'c0c9af7f': 'AdditionalAP', //TODO actual name, monitor. unverifiable BonusAD
	'f2474447': 'TooltipBonus',
	'9fd37c1c': 'UNUSED_APTimer', //TODO verify https://leagueoflegends.fandom.com/wiki/Chalice_of_Power_(Teamfight_Tactics)
	'fa1ef605': 'UNUSED_MagicDamageReductionMultiplier', //TODO verify https://leagueoflegends.fandom.com/wiki/Dragon%27s_Claw_(Teamfight_Tactics)
	'79a4455a': 'CritReduction',
	'b1442c34': 'StealthDuration', //TODO verify
	'5c51b509': 'Colossus/Mutant/Socialite', //TODO ??
	'7f1304b2': 'AbilityPower',
	'df962703': 'ADBoost',
	'c9b0e3af': 'PercentOmnivamp',
	'ce492058': 'ManaGrant',
	'2fb31c01': 'Frequency',
	'e86b1aa9': 'BonusHealthTooltip',

	'76882e8f': 'MutantCyberHealth',
	'190fb0a2': 'MutantMetamorphosisArmorMR',
}

const unreplacedIDs = new Set(Object.keys(stringIDReplacements))

const traitKeys = (traits as TraitData[])
	.map(trait => {
		const nameKey = trait.apiName.split('_')[1]
		return `${nameKey} = '${nameKey}'`
	})
	.sort((a, b) => a.localeCompare(b))
	.join(', ')

traits.forEach((trait: TraitData) => {
	for (const normalize in normalizeKeys) {
		trait.desc = trait.desc.replace(normalize, normalizeKeys[normalize])
	}
	trait.effects.forEach(effect => {
		Object.keys(effect.variables).forEach(key => {
			const originalValue = effect.variables[key]
			if (key.startsWith('{')) {
				const keyHash = key.slice(1, -1)
				const replacement = stringIDReplacements[keyHash]
				if (replacement) {
					unreplacedIDs.delete(keyHash)
					delete effect.variables[key]
					key = replacement
					effect.variables[key] = originalValue
				}
			}
			for (const normalize in normalizeKeys) {
				delete effect.variables[key]
				key = key.replace(normalize, normalizeKeys[normalize])
				effect.variables[key] = originalValue
			}
		})
	})
})
const traitKeysString = `export enum TraitKey {\n\t${traitKeys}\n}`

currentItems.forEach((item: ItemData) => {
	if (item.id === ItemKey.HandOfJustice) {
		const invalidKey = 'BonusAD'
		if (item.effects[invalidKey] != null) {
			delete item.effects[invalidKey]
		} else {
			console.log('Normalize', ItemKey.HandOfJustice, invalidKey, 'missing', item.effects)
		}
	}
	for (const normalize in normalizeKeys) {
		item.desc = item.desc.replace(normalize, normalizeKeys[normalize])
	}
	Object.keys(item.effects).forEach(key => {
		const originalValue = item.effects[key]
		if (key.startsWith('{')) {
			const keyHash = key.slice(1, -1)
			const replacement = stringIDReplacements[keyHash]
			if (replacement) {
				unreplacedIDs.delete(keyHash)
				delete item.effects[key]
				key = replacement
				item.effects[key] = originalValue
			}
		}
		for (const normalize in normalizeKeys) {
			delete item.effects[key]
			key = key.replace(normalize, normalizeKeys[normalize])
			item.effects[key] = originalValue
		}
	})
})
const itemKeys = currentItems
	.sort((a, b) => a.id - b.id)
	.map(({name, id}) => {
		const key = name.replace(/['.]/g, '').split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join('')
		return `${key} = ${id}`
	})
	.join(', ')
const itemKeysString = `export enum ItemKey {\n\t${itemKeys}\n}`

if (unreplacedIDs.size) {
	console.log('Unused substitutions', unreplacedIDs)
}

await Promise.all([
	fs.writeFile(path.resolve(outputFolder, 'champions.ts'), `import type { ChampionData } from '#/helpers/types'\n\nexport const champions: ChampionData[] = ` + JSON.stringify(outputChampions, undefined, '\t')),
	fs.writeFile(path.resolve(outputFolder, 'traits.ts'), `import type { TraitData } from '#/helpers/types'\n\n${traitKeysString}\n\nexport const traits: TraitData[] = ` + JSON.stringify(traits, undefined, '\t').replace(/"null"/g, 'null')),
	fs.writeFile(path.resolve(outputFolder, 'items.ts'), `import type { ItemData } from '#/helpers/types'\n\n${itemKeysString}\n\nexport const items: ItemData[] = ` + JSON.stringify(currentItems, undefined, '\t')),
])
