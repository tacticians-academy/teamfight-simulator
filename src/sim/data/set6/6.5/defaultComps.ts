import type { CustomComps } from "#/sim/data/types"

export const defaultComps = {
	Yordles: {
		augments: ["So Small"],
		units: [
			{ name: "Gnar", hex: [5, 5], starLevel: 3, items: [] },
			{ name: "Jinx", hex: [3, 7], starLevel: 1, items: [] },
			{ name: "Poppy", hex: [4, 4], starLevel: 3, items: [] },
			{ name: "Ziggs", hex: [6, 7], starLevel: 3, items: [] },
			{ name: "Veigar", hex: [1, 7], starLevel: 1, items: [] },
			{ name: "Lulu", hex: [0, 7], starLevel: 3, items: [] },
			{ name: "Vex", hex: [2, 4], starLevel: 3, items: [55, 66, 77] },
			{ name: "Corki", hex: [5, 7], starLevel: 3, items: [44, 39, 19] },
		],
	},
	Hextech: {
		augments: ["Hextech Heart"],
		units: [
			{ name: "Jarvan IV", hex: [5, 7], starLevel: 2, items: [] },
			{ name: "Swain", hex: [6, 4], starLevel: 2, items: [] },
			{ name: "Sivir", hex: [6, 7], starLevel: 2, items: [23, 29, 69] },
			{ name: "Alistar", hex: [4, 4], starLevel: 2, items: [55, 37, 77] },
			{ name: "Sejuani", hex: [2, 4], starLevel: 2, items: [] },
			{ name: "Nocturne", hex: [4, 7], starLevel: 2, items: [] },
			{ name: "Lucian", hex: [0, 6], starLevel: 2, items: [] },
		],
	},
} as CustomComps
