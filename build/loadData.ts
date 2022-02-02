const LOAD_PBE = true

import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

import type { ChampionData, ItemData, TraitData } from '../src/helpers/types'

const url = `https://raw.communitydragon.org/${LOAD_PBE ? 'pbe' : 'latest'}/cdragon/tft/en_us.json`
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
const spatulaItemKey = `/spatula/set${currentSetNumber}/`
const foundItemIDs: number[] = []
const currentItems = (itemData as ItemData[]).reverse().filter(item => {
	if (foundItemIDs.includes(item.id)) {
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
			console.log('No icon for champion, excluding.', champion)
			return false
		}
		return true
	})

const normalizeKeys: Record<string, string> = {
	AbilityPower: 'AP',
	SP: 'AP',
	BaseAP: 'AP',
	BonusAP: 'AP',
	AttackDamage: 'AD',
	BaseAD: 'AD',
	BonusAD: 'AD',
	ADBoost: 'AD',
	AttackSpeed: 'AS',
	Health: 'HP',
	BonusHP: 'HP',
	BonusArmor: 'Armor',
	MagicResist: 'MR',
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
	'47343861': 'MR',
	'98396b21': 'HealShieldBoost',
	'16394c87': 'HexRangeIncrease',
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
	fs.writeFile(path.resolve(outputFolder, 'champions.ts'), `import type { ChampionData } from '#/helpers/types'\n\nexport const champions: ChampionData[] = ` + JSON.stringify(playableChampions, undefined, '\t')),
	fs.writeFile(path.resolve(outputFolder, 'traits.ts'), `import type { TraitData } from '#/helpers/types'\n\n${traitKeysString}\n\nexport const traits: TraitData[] = ` + JSON.stringify(traits, undefined, '\t').replace(/"null"/g, 'null')),
	fs.writeFile(path.resolve(outputFolder, 'items.ts'), `import type { ItemData } from '#/helpers/types'\n\n${itemKeysString}\n\nexport const items: ItemData[] = ` + JSON.stringify(currentItems, undefined, '\t')),
])
