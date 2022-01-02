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
