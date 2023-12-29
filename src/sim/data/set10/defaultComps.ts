import type { CustomComps, RolldownConfig } from "#/sim/data/types"
import { ItemKey } from '@tacticians-academy/academy-library'
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set10/champions'

export const defaultComps: CustomComps = {
}

export const rolldownConfigs: RolldownConfig[] = [
	{
		stage: 4,
		gold: 60,
		xp: 78,
		contestedUnits: ['TFT10_Ekko', 'TFT10_Ahri', 'TFT10_Akali', 'TFT10_Caitlyn', 'TFT10_Ezreal', 'TFT10_Poppy'],
		items: [],
		units: [
			{ id: ChampionKey.KSante, hex: [3, 4], starLevel: 2, items: [`TFT_Item_GargoyleStoneplate`, 'TFT_Item_Crownguard'] },
			{ id: ChampionKey.Sett, hex: [2, 5], starLevel: 1, items: [] },
			{ id: ChampionKey.Ezreal, hex: [0, 7], starLevel: 1, items: [`TFT_Item_BlueBuff`, 'TFT_Item_RapidFireCannon'] },
		],
	},
]
