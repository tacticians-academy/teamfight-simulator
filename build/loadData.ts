import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

import type { ChampionData, ItemData, TraitData } from '../src/helpers/types'

const response = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/en_us.json')
if (!response.ok) {
	throw response
}
const responseJSON = await response.json() as Record<string, any>

const currentSetNumber = Object.keys(responseJSON.sets).reduce((previous, current) => Math.max(previous, parseInt(current, 10)), 0)
const { champions, traits } = (responseJSON as any).sets[currentSetNumber]

const itemData = responseJSON.items as Record<string, any>[]
const standardComponents = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const spatulaItemKey = `/spatula/set${currentSetNumber}/`
const foundItemIDs: number[] = []
const currentItems = itemData.filter(item => {
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

const unplayableNames = ['TFT5_EmblemArmoryKey', 'TFT6_MercenaryChest']
const playableChampions = (champions as ChampionData[])
	.filter(champion => !unplayableNames.includes(champion.apiName))

const traitKeys = (traits as TraitData[])
	.map(trait => {
		const nameKey = trait.apiName.split('_')[1]
		return `${nameKey} = '${nameKey}'`
	})
	.join(', ')

const stringIDReplacements: Record<string, string> = {
	'b4a90a5d': 'ProcChance',
	'0acd95c2': 'ImperialBonusDamage',
	'f469c9e6': 'TyrantTooltipBonusDamage',
	'45564848': 'InnovationStarLevel', //TODO actual string
	'97ea7bfc': 'InnovatorStarLevelMultiplier', //TODO actual string
	'5263ba40': 'JinxEmpoweredAS',
	'2a50526a': 'JinxASDuration',
	'3b173c39': '{3b173c39}', //TODO sister ??
	'471b1a16': 'TickRate',
	'd0539890': 'ManaPerTick',
	'6c155e99': 'OmnivampPercent',
	'f9f3a081': 'ManaPerSecond',
	'65722d9c': 'ADAPBase',
	'96ca059f': 'ADAPPerCast',
	'b3105623': 'ManaPerAllyAttack',
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
	'47343861': 'MagicResistance',
	'98396b21': 'HealShieldBoost',
	'16394c87': 'HexRangeIncrease',
	'75994f47': 'PercentDamageIncrease',
	'17cfa971': 'BurstDuration',
	'867bc055': 'SyndicateIncrease',
	// '': '',
}

traits.forEach((trait: TraitData) => {
	trait.effects.forEach(effect => {
		Object.keys(effect.variables).forEach(key => {
			if (key.startsWith('{')) {
				const replacement = stringIDReplacements[key.slice(1, -1)]
				if (replacement) {
					const originalValue = effect.variables[key]
					delete effect.variables[key]
					effect.variables[replacement] = originalValue
				}
			}
		})
	})
})
const traitKeysString = `export enum TraitKey {\n\t${traitKeys}\n}`

const itemKeys = (currentItems as ItemData[])
	.map(item => `${item.name.replace(/['. ]/g, '')} = ${item.id}`)
	.join(', ')
const itemKeysString = `export enum ItemKey {\n\t${itemKeys}\n}`

await Promise.all([
	fs.writeFile(path.resolve(outputFolder, 'champions.ts'), `import type { ChampionData } from '#/helpers/types'\n\nexport const champions: ChampionData[] = ` + JSON.stringify(playableChampions, undefined, '\t')),
	fs.writeFile(path.resolve(outputFolder, 'traits.ts'), `import type { TraitData } from '#/helpers/types'\n\n${traitKeysString}\n\nexport const traits: TraitData[] = ` + JSON.stringify(traits, undefined, '\t').replace(/"null"/g, 'null')),
	fs.writeFile(path.resolve(outputFolder, 'items.ts'), `import type { ItemData } from '#/helpers/types'\n\n${itemKeysString}\n\nexport const items: ItemData[] = ` + JSON.stringify(currentItems, undefined, '\t')),
])
