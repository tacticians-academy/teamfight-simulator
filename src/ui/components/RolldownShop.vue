<script setup lang="ts">
import UnitCircle from '#/ui/components/UnitCircle.vue'
import UnitOverlay from '#/ui/components/UnitOverlay.vue'

import { onBeforeUnmount, onMounted, reactive, watch } from 'vue'

import { setData, useStore } from '#/store/store'
import { getDragName, getDragType, onDragOver, onDropSell } from '#/ui/helpers/dragDrop'
import { getIconURLFor } from '#/ui/helpers/utils'
import { ChampionUnit } from '#/sim/ChampionUnit'
import type { StarLevel } from '#/sim/helpers/types'

const { state, getters, dropUnit, resetUnitPools } = useStore()

const { currentLevelData } = getters

function onBuyXP() {
	if (state.gold < 4) return

	state.gold -= 4
	state.xp += 4
}

type ShopUnit = {
	apiName: string
	name: string
	countFromPool: number
	baseCost: number
	totalPrice: number
	icon: string
	starLevel: StarLevel
	traits: string[]
	chosenTraits: string[]
}
const shop = reactive<(ShopUnit | null)[]>([null, null, null, null, null])
function onReroll() {
	if (state.gold < 2) return

	state.gold -= 2
	refreshShop()
}

function onKey(event: KeyboardEvent) {
	if (event.key === 'd') {
		onReroll()
	} else if (event.key === 'f') {
		onBuyXP()
	}
}
onMounted(() => {
	document.addEventListener('keyup', onKey, false)
})
onBeforeUnmount(() => {
	document.removeEventListener('keyup', onKey, false)
})

function onDrop(event: DragEvent, benchIndex: number) {
	const type = getDragType(event)
	if (type !== 'unit') return
	const name = getDragName(event)
	if (name == null) return
	const dragUnit = state.dragUnit
	if (dragUnit == null) return

	dropUnit(event, dragUnit.data.apiName, undefined, benchIndex)
}

function getWeightedRandom(data: [value: any, weight: number][], minWeight: number = 1) {
	let acc = 0
	const sorted = data
		.filter(entry => entry[1] > minWeight - 1)
		.sort((a, b) => a[1] - b[1])
		.map(entry => {
			acc += entry[1]
			entry[1] = acc
			return entry
		})
	const random = Math.random() * acc
	return sorted.find(entry => entry[1] > random)![0]
}

function refreshShop() {
	state.rollToChosen -= 1
	let getChosen = !state.chosen && setData.headlinerSystemParameters ? state.rollToChosen <= 0 : false
	if (getChosen) {
		state.rollToChosen = setData.headlinerSystemParameters!['HeadlinerFrequency']
	}
	for (let index = shop.length - 1; index >= 0; index -= 1) {
		const element = shop[index]
		const starLevel: StarLevel = getChosen ? 2 : 1
		const levelIndex = currentLevelData.value[0] - 1
		const shopCostOdds = (getChosen ? setData.dropRates['Headliner'] : setData.levelShopOdds)[levelIndex]
		const baseCost = getWeightedRandom(shopCostOdds.map((a, index) => [index + 1, a]))
		const units = setData.tierBags[baseCost]
		const countFromPool = Math.pow(3, starLevel - 1)
		const apiName = getWeightedRandom(Object.entries(units), countFromPool)
		const unit = setData.champions.find(unitData => unitData.apiName === apiName)!
		const shopUnit = {
			name: unit.name,
			apiName,
			baseCost,
			countFromPool,
			totalPrice: baseCost * countFromPool,
			icon: unit.icon,
			starLevel,
			traits: unit.traits,
			chosenTraits: [],
		}
		shop[index] = shopUnit
		if (getChosen) {
			getChosen = false
		}
	}
}

watch(() => state.rolldownActive, () => {
	if (state.rolldownActive) {
		state.rolldownActive = false
		shop.fill(null)
	} else {
		refreshShop()
	}
	resetUnitPools()
})

function onBuy(shopItem: ShopUnit, shopIndex: number) {
	if (state.gold < shopItem.totalPrice) return

	const benchIndex = state.benchUnits.findIndex(benchSpace => benchSpace == null)
	if (benchIndex === -1) return

	state.gold -= shopItem.totalPrice
	shop[shopIndex] = null
	state.unitPools[shopItem.baseCost][shopItem.apiName] += shopItem.countFromPool

	const unit = new ChampionUnit(shopItem.apiName, undefined, shopItem.starLevel)
	unit.benchIndex = benchIndex
	state.benchUnits[benchIndex] = unit
}
</script>

<template>
<div class="absolute left-0 bottom-0 right-0 bg-primary">
	<div class="bench-ui  p-1 space-x-1  flex">
		<div
			v-for="(benchUnit, index) in state.benchUnits" :key="index"
			class="bench-space  relative flex-1 aspect-square border-4 border-secondary  flex"
			@dragover="onDragOver" @drop="onDrop($event, index)"
		>
			<UnitCircle v-if="benchUnit" :unit="benchUnit" class="flex-1">
				<UnitOverlay v-if="benchUnit" :unit="benchUnit" />
			</UnitCircle>
		</div>
	</div>
	<div class="flex justify-between">
		<div class="w-32">
			<div class="flex justify-between">
				<div>Lvl. {{ currentLevelData[0] }}</div>
				<div>{{ currentLevelData[1] }}/{{ currentLevelData[2] }}</div>
			</div>
			<div class="flex w-full">
				<div v-for="markIndex in (currentLevelData[2] / 4)" :key="markIndex" class="flex-grow m-px h-0.5" :class="markIndex * 4 <= currentLevelData[1] ? 'bg-team-a' : 'bg-secondary'" />
			</div>
		</div>
		<div>{{ state.gold }}g</div>
		<div class="w-32 text-right">🔓</div>
	</div>
	<div class="shop-ui  p-1 space-x-1  flex" @dragover="onDragOver" @drop="onDropSell">
		<div class="shop-buttons  flex flex-col">
			<button :disabled="state.gold < 4" @click="onBuyXP">
				<div>Buy XP</div><div>4</div>
			</button>
			<button :disabled="state.gold < 2" @click="onReroll">
				<div>Reroll</div><div>2</div>
			</button>
		</div>
		<div v-for="(shopItem, index) in shop" :key="index" class="flex-1 p-1 bg-secondary">
			<button v-if="shopItem" class="w-full h-full  flex flex-col justify-between" @click="onBuy(shopItem, index)">
				<div class="relative w-full">
					<!-- :style="{ backgroundImage: `url(${})` }" -->
					<img :src="getIconURLFor(state, shopItem)" class="w-full rounded-sm pointer-events-none">
					<div v-if="shopItem.starLevel > 1" class="shop-stars  absolute top-0">
						{{ Array(shopItem.starLevel).fill('★').join('') }}
					</div>
					<div class="shop-traits  absolute bottom-0 text-left">
						<div v-for="trait in shopItem.traits" :key="trait" class="flex items-center">
							<img :src="getIconURLFor(state, setData.traits.find(t => t.name === trait) ?? setData.traits[0])" class="shop-trait  border border-black mx-1">
							<div>{{ trait }}</div>
						</div>
					</div>
				</div>
				<div v-if="shopItem" class="shop-name  w-full px-1 font-serif  flex justify-between">
					<div>{{ shopItem.name }}</div>
					<div>{{ shopItem.totalPrice }}</div>
				</div>
			</button>
		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.shop-ui {
	height: 9.5vw;
}
.shop-buttons button {
	@apply text-left;
}

.shop-stars {
	margin-left: 0.375vw;
	margin-top: -0.75vw;
	font-size: 1.3vw;
}
.shop-traits {
	font-size: 1.0vw;
	font-weight: 300;
}
.shop-name {
	font-size: 1.2vw;
}

.shop-trait {
	@apply bg-gray-700 p-0.5 pointer-events-none aspect-square;
	width: 1.2vw;
}
</style>
