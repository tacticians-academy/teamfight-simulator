import type { CustomComps, RolldownConfig } from "#/sim/data/types"
import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6.5/champions'

export const defaultComps: CustomComps = {
	Yordles: {
		augments: ["So Small"],
		units: [
			{ id: ChampionKey.Gnar, hex: [5, 5], starLevel: 3, items: [] },
			{ id: ChampionKey.Jinx, hex: [3, 7], starLevel: 1, items: [] },
			{ id: ChampionKey.Poppy, hex: [4, 4], starLevel: 3, items: [] },
			{ id: ChampionKey.Ziggs, hex: [6, 7], starLevel: 3, items: [] },
			{ id: ChampionKey.Veigar, hex: [1, 7], starLevel: 1, items: [] },
			{ id: ChampionKey.Lulu, hex: [0, 7], starLevel: 3, items: [] },
			{ id: ChampionKey.Vex, hex: [2, 4], starLevel: 3, items: [55, 66, 77] },
			{ id: ChampionKey.Corki, hex: [5, 7], starLevel: 3, items: [44, 39, 19] },
		],
	},
	Hextech: {
		augments: ["Hextech Heart"],
		units: [
			{ id: ChampionKey.JarvanIV, hex: [5, 7], starLevel: 2, items: [] },
			{ id: ChampionKey.Swain, hex: [6, 4], starLevel: 2, items: [] },
			{ id: ChampionKey.Sivir, hex: [6, 7], starLevel: 2, items: [23, 29, 69] },
			{ id: ChampionKey.Alistar, hex: [4, 4], starLevel: 2, items: [55, 37, 77] },
			{ id: ChampionKey.Sejuani, hex: [2, 4], starLevel: 2, items: [] },
			{ id: ChampionKey.Nocturne, hex: [4, 7], starLevel: 2, items: [] },
			{ id: ChampionKey.Lucian, hex: [0, 6], starLevel: 2, items: [] },
		],
	},
}

export const rolldownConfigs: RolldownConfig[] = [
]
