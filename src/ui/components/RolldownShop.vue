<script setup lang="ts">
import UnitCircle from '#/ui/components/UnitCircle.vue'
import UnitOverlay from '#/ui/components/UnitOverlay.vue'

import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

import { getAssetPrefixFor } from '@tacticians-academy/academy-library'
import type { ChampionData, TraitData } from '@tacticians-academy/academy-library'

import type { StarLevel } from '#/sim/helpers/types'
import { getWeightedRandom, isEmpty, shuffle } from '#/sim/helpers/utils'

import { setData, useStore, getOwnedCountOf } from '#/store/store'

import { getDragName, getDragType, onDragOver, onDropSell } from '#/ui/helpers/dragDrop'
import { getIconURLFor } from '#/ui/helpers/utils'

const { state, getters: { currentLevelData }, dropUnit, canBuy, startDragging, buyUnit } = useStore()

const headlinerMaskURL = `url(${getAssetPrefixFor(10, true)}assets/ux/tft/mograph/sets/set10/tft_headliner_badge_mask.tft_set10.png`

const shopUIURL = computed(() => {
	const prefix = getAssetPrefixFor(state.setNumber, true) + 'assets/ux/tft/tft_hud_texture_atlas'
	const setVersioned = state.setNumber >= 9.5
		? 9.5
		: state.setNumber >= 8
			? 8
			: state.setNumber === 6.5
				? 6.5
				: null
	const suffix = setVersioned ? `.tft_set${setVersioned.toString().replace('.5', '_stage2')}` : ''
	return `url(${prefix}${suffix}.png)`
})

const disableXP = computed(() => !state.rolldownActive || state.gold < 4 || currentLevelData.value[2] <= 0)
const disableReroll = computed(() => !state.rolldownActive || state.gold < 2)

function onBuyXP() {
	if (disableXP.value) return

	state.gold -= 4
	state.xp += 4
}
function onReroll() {
	if (disableReroll.value) return

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

let preloadImages: HTMLImageElement[] = []
function refreshImageCache() {
	preloadImages = []
	for (const unit of setData.champions) {
		const img = new Image()
		img.src = getIconURLFor(state, unit)
		preloadImages.push(img)
	}
	for (const trait of setData.traits) {
		const img = new Image()
		img.src = getIconURLFor(state, trait)
		preloadImages.push(img)
	}
}

onMounted(() => {
	document.addEventListener('keyup', onKey, false)
	refreshImageCache()
})
onBeforeUnmount(() => {
	document.removeEventListener('keyup', onKey, false)
})

function onDrop(event: DragEvent, benchIndex: number) {
	const name = getDragName(event)
	if (name == null) return
	const type = getDragType(event)
	if (type === 'shop') {
		const shopIndex = parseInt(name, 10)
		if (isNaN(shopIndex)) return
		const shopUnit = state.shop[shopIndex]
		if (!shopUnit) return

		buyUnit(shopUnit, shopIndex)
	} else if (type === 'unit') {
		dropUnit(event, name, undefined, benchIndex)
	}
}

const HEADLINER_COST_MAXIMUM_COPIES = [
	null,
	null,
	null,
	4,
	3,
]

function refreshShop() {
	state.shopNumber += 1
	state.shopSinceChosen += 1
	const chosenFrequency = setData.headlinerSystemParameters?.['HeadlinerFrequency']
	let getChosen = chosenFrequency != null && (!state.chosen || (setData.headlinerSystemParameters ? state.shopSinceChosen >= chosenFrequency : false))
	for (let shopIndex = state.shop.length - 1; shopIndex >= 0; shopIndex -= 1) {
		const starLevel: StarLevel = getChosen ? 2 : 1
		const levelIndex = currentLevelData.value[0] - 1
		const shopCostOdds = (getChosen ? setData.dropRates['Headliner'] : setData.dropRates['Shop'])[levelIndex]
		const baseCost = getWeightedRandom(shopCostOdds.map((a, shopIndex) => [shopIndex + 1, a]))
		const maxOwnedCopies = HEADLINER_COST_MAXIMUM_COPIES[baseCost]
		const units = state.shopUnitPools[baseCost]
		const countFromPool = Math.pow(3, starLevel - 1)
		const chosenTraits: Record<string, number> = {}
		let unitApiName = ''
		let unit: ChampionData | undefined
		let attemptsLeft = 9
		while (unit == null) {
			attemptsLeft -= 1
			if (attemptsLeft <= 0) {
				break
			}
			unitApiName = getWeightedRandom(Object.entries(units).filter(unit => unit[1] != null), countFromPool)
			const costRepeatLimit = setData.headlinerSystemParameters?.[`${baseCost}CostChampNoRepeatNum`]
			const unitLastShopNumber = state.chosenUnitLastShop[unitApiName]
			if (costRepeatLimit != null && unitLastShopNumber != null && unitLastShopNumber > state.shopNumber - costRepeatLimit) {
				continue
			}
			const checkUnit = setData.champions.find(unitData => unitData.apiName === unitApiName)
			if (checkUnit && getChosen) {
				const groupAPIName = setData.combinePoolAPINames[unitApiName] ?? unitApiName
				const totalUnitPoolCount = setData.tierBags[baseCost][groupAPIName]
				const remainingUnitPoolCount = state.shopUnitPools[baseCost][groupAPIName]
				if (remainingUnitPoolCount == null || totalUnitPoolCount == null) {
					console.error(unitApiName, groupAPIName, 'remainingUnitPoolCount', remainingUnitPoolCount, 'totalUnitPoolCount', totalUnitPoolCount)
					continue
				}
				if (maxOwnedCopies != null && getOwnedCountOf(groupAPIName) > maxOwnedCopies) {
					console.log(groupAPIName, 'exceeds max owned count', maxOwnedCopies, getOwnedCountOf(groupAPIName))
					continue
				}

				const possibleTraits = checkUnit.traits
					.map(traitName => setData.traits.find(trait => trait.name === traitName))
					.filter((trait): trait is TraitData => trait != null && trait.effects.length > 1)
				shuffle(possibleTraits)
				for (const possibleTrait of possibleTraits) {
					const traitKey = possibleTrait.apiName
					if (traitKey == null || state.chosenUnitLastTrait[unitApiName] === traitKey || state.chosenPreviousTraits.includes(traitKey)) {
						continue
					}
					const recentTraitNoRepeatNum = setData.headlinerSystemParameters?.['RecentTraitNoRepeatNum']
					if (recentTraitNoRepeatNum != null) {
						state.chosenPreviousTraits.push(traitKey)
						if (state.chosenPreviousTraits.length > recentTraitNoRepeatNum) {
							state.chosenPreviousTraits.shift()
						}
					}
					state.chosenUnitLastShop[unitApiName] = state.shopNumber
					state.chosenUnitLastTrait[unitApiName] = traitKey
					chosenTraits[possibleTrait.name] = 2
					break
				}
			}
			unit = checkUnit
		}
		if (unit) {
			const shopUnit = {
				name: unit.name,
				apiName: unitApiName,
				groupAPIName: setData.combinePoolAPINames[unitApiName] ?? unitApiName,
				baseCost,
				countFromPool,
				totalPrice: baseCost * countFromPool,
				icon: unit.icon,
				starLevel,
				traits: unit.traits,
				chosenTraits: !isEmpty(chosenTraits) ? chosenTraits : undefined,
			}
			state.shop[shopIndex] = shopUnit
			if (getChosen) {
				state.shopSinceChosen = 0
				getChosen = false
			}
		}
	}
}

watch(() => state.didStart, () => {
	if (state.didStart) {
		refreshImageCache()
		refreshShop()
	}
})
</script>

<template>
<div class="absolute left-0 bottom-0 right-0 bg-primary">
	<div class="bench-ui p-1 space-x-1  flex">
		<div
			v-for="(benchUnit, index) in state.benchUnits" :key="index"
			class="bench-space  flex-1 w-0 aspect-square relative border-4 border-secondary  flex"
			@dragover="onDragOver" @drop="onDrop($event, index)"
		>
			<UnitCircle v-if="benchUnit" :unit="benchUnit" class="flex-1">
				<UnitOverlay v-if="benchUnit" :unit="benchUnit" />
			</UnitCircle>
		</div>
	</div>
	<div class="flex justify-between">
		<div class="shop-top">
			<div class="flex justify-between">
				<div>Lvl. {{ currentLevelData[0] }}</div>
				<div v-if="currentLevelData[2] > 0">{{ currentLevelData[1] }}/{{ currentLevelData[2] }}</div>
			</div>
			<div class="flex w-full" :class="currentLevelData[2] <= 0 ? 'invisible' : ''">
				<div v-for="markIndex in ((currentLevelData[2] || 4) / 4)" :key="markIndex" class="flex-grow m-px h-0.5" :class="markIndex * 4 <= currentLevelData[1] ? 'bg-team-a' : 'bg-secondary'" />
			</div>
		</div>
		<div class="shop-top  text-center">{{ state.gold }}g</div>
		<div class="shop-top  text-right">🔓</div>
	</div>
	<div class="shop-ui  flex" @dragover="onDragOver" @drop="onDropSell">
		<div class="shop-buttons  flex flex-col">
			<button :disabled="disableXP" @click="onBuyXP">
				<div>Buy XP</div><div>4</div>
			</button>
			<button :disabled="disableReroll" @click="onReroll">
				<div>Reroll</div><div>2</div>
			</button>
		</div>
		<div v-for="(shopItem, index) in state.shop" :key="index" class="shop-item  flex-1 bg-secondary text-white">
			<button
				v-if="shopItem" :disabled="!state.rolldownActive || !canBuy(shopItem)"
				:class="`cost-${shopItem.baseCost}`" class="shop-item-content  relative  flex flex-col"
				:draggable="state.rolldownActive && canBuy(shopItem)" @dragstart="startDragging($event, 'shop', index.toString(), null)"
				@click="buyUnit(shopItem, index)"
			>
				<div :style="{ backgroundImage: `url(${getIconURLFor(state, shopItem)})` }" class="shop-unit-area  bg-cover" />

				<div class="absolute inset-0 z-50">
					<div class="shop-unit-area  relative">
						<div class="shop-traits">
							<div v-for="trait in shopItem.traits" :key="trait" class="shop-trait" :class="shopItem.chosenTraits?.[trait] ? 'chosen' : null">
								<div v-if="shopItem.chosenTraits?.[trait]" class="shop-chosen-count">{{ shopItem.chosenTraits[trait] }}</div>
								<img :src="getIconURLFor(state, setData.traits.find(t => t.name === trait) ?? setData.traits[0])" class="border border-black">
								<div>{{ trait }}</div>
							</div>
						</div>
					</div>
					<div v-if="shopItem" class="shop-name  font-serif  flex items-center justify-between">
						<div>{{ shopItem.name }}</div>
						<div>{{ shopItem.totalPrice }}</div>
					</div>
				</div>
				<div class="shop-item-frame" :style="{ backgroundImage: shopUIURL }">
					<div v-if="shopItem.starLevel > 1" class="shop-stars  absolute top-0" :class="shopItem.starLevel === 3 ? 'star-3' : (shopItem.starLevel === 2 ? 'star-2' : 'star-1')">
						{{ Array(shopItem.starLevel).fill('★').join('') }}
					</div>
					<div v-if="shopItem.chosenTraits" class="shop-headliner-overlay  relative">
						<img :src="getAssetPrefixFor(state.setNumber, true) + 'assets/ux/tft/mograph/sets/set10/tft10_gradient.tft_set10.png'" class="shop-headliner-glow  w-full h-full absolute inset-0">
						<img :src="getAssetPrefixFor(state.setNumber, true) + 'assets/ux/tft/mograph/sets/set10/tft_headliner_badge_top.tft_set10.png'" class="w-full h-full">
						<!-- <img :src="getAssetPrefixFor(state.setNumber, true) + 'assets/ux/tft/mograph/sets/set10/tft_headliner_badge_icon.tft_set10.png'" class="absolute inset-0"> -->
					</div>
				</div>
			</button>

		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.shop-ui {
	height: 10.59vw;
	padding: 0.1vw;
	margin-right: 0.5vw;
}
.shop-item {
	margin-left: 0.5vw;
	margin-bottom: 0.5vw;
}
.shop-top {
	@apply w-32 mx-1;
}
.shop-buttons button {
	@apply text-left;
	width: 5vw;
}

.hex-unit {
	@apply w-full;
}

.shop-stars {
	margin-left: 0.2vw;
	margin-top: -0.8vw;
	font-size: 1.3vw;
	-webkit-text-stroke: 1px #000;
}
.shop-traits {
	@apply absolute inset-0 h-full  text-left  flex flex-col justify-end;
	padding-bottom: 0.05vw;
	font-size: 1.0vw;
	font-weight: 300;
}
.shop-name {
	padding: 0 0.7vw;
	height: 2.3vw;
	font-size: 1.2vw;
}

.shop-trait {
	@apply flex items-center;
}
.shop-trait img {
	@apply bg-gray-700 p-0.5 pointer-events-none aspect-square;
	width: 1.2vw;
	margin: 0 0.25vw;
}
.shop-trait.chosen img {
	box-shadow: white 0 0 4px 1px;
}

.shop-headliner-glow {
	mask-repeat: no-repeat;
	mask-size: contain;
	mask-position: center;
	mask-image: v-bind(headlinerMaskURL);
	mask-mode: luminance;
	mask-type: luminance;
}
.shop-headliner-overlay {
	@apply absolute;
	top: -0.7vw;
	right: -1.9vw;
}
.shop-headliner-overlay > * {
	@apply block;
	width: 6vw;
}
.shop-item-content {
	@apply w-full h-full rounded-sm;
	@apply disabled:opacity-30;
}

.shop-unit-area {
	@apply mx-auto;
	box-sizing: border-box;
	margin-top: 0.37vw;
	width: calc(100% - 0.7vw);
	height: 7.15vw;
	/* padding: 1vw; */
}

.shop-item-frame {
	@apply absolute inset-0 w-full h-full;
	background-size: 124.5vw;
}

.cost-1 .shop-item-frame, .cost-3 .shop-item-frame, .cost-5 .shop-item-frame {
	background-position-x: -1.02vw;
}
.cost-1 .shop-item-frame, .cost-2 .shop-item-frame {
	background-position-y: -88.43vw;
}
.cost-2 .shop-item-frame, .cost-4 .shop-item-frame {
	background-position-x: -28.12vw;
}
.cost-3 .shop-item-frame, .cost-4 .shop-item-frame {
	background-position-y: -98.83vw;
}
.cost-5 .shop-item-frame {
	background-position-y: -109.23vw;
}
.shop-item-content:not(:disabled) {
	&.cost-1:hover .shop-item-frame, &.cost-3:hover .shop-item-frame, &.cost-5:hover .shop-item-frame {
		background-position-x: -14.57vw;
	}
	&.cost-2:hover .shop-item-frame, &.cost-4:hover .shop-item-frame {
		background-position-x: -41.67vw;
	}
}

.shop-chosen-count {
	@apply absolute bg-black border border-black;
	height: 1vw;
	line-height: 1vw;
	left: -0.3vw;
}
</style>
