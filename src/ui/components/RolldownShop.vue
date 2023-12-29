<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import UnitCircle from '#/ui/components/UnitCircle.vue'
import UnitOverlay from '#/ui/components/UnitOverlay.vue'

import { useStore } from '#/store/store'
import { getDragName, getDragType, onDragOver, onDropSell } from '#/ui/helpers/dragDrop'

const { state, getters, dropUnit } = useStore()

const { currentLevelData } = getters

function onBuyXP() {
	if (state.gold < 4) return

	state.gold -= 4
	state.xp += 4
}
function onReroll() {
	if (state.gold < 2) return

	state.gold -= 2
	//TODO
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
</script>

<template>
<div class="absolute left-0 bottom-0 right-0 bg-primary">
	<div class="bench-ui  p-1 space-x-1  flex">
		<div
			v-for="benchIndex in 9" :key="benchIndex"
			class="bench-space  relative flex-1 aspect-square border-4 border-secondary  flex"
			@dragover="onDragOver" @drop="onDrop($event, benchIndex)"
		>
			<UnitCircle v-if="state.benchUnits[benchIndex]" :unit="state.benchUnits[benchIndex]!">
				<UnitOverlay v-if="state.benchUnits[benchIndex]" :unit="state.benchUnits[benchIndex]!" />
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
		<div v-for="a in 5" :key="a" class="flex-grow border-4 border-secondary" />
	</div>
</div>
</template>

<style scoped lang="postcss">
.shop-ui {
	height: 10vw;
}
.shop-buttons button {
	@apply text-left;
}
</style>
