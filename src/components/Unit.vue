<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { ChampionUnit } from '#/game/unit'
import type { StarLevel } from '#/game/types'

import { useStore } from '#/game/board'
import { getIconURL } from '#/helpers/utils'

const { state, setStarLevel, dragUnit } = useStore()

const props = defineProps<{
	unit: ChampionUnit
}>()

const currentPosition = computed(() => {
	const [col, row] = props.unit.currentPosition()
	const [x, y] = state.hexRowsCols[row][col].position
	return [x * 100, y * 100]
})

const unitSizeX = `${100 * state.hexProportionX * 0.8}%`
const unitSizeY = `${100 * state.hexProportionY * 0.8}%`

function onDragStart(event: DragEvent) {
	dragUnit(event, props.unit)
}

function onStar(starLevel: number) {
	setStarLevel(props.unit, starLevel as StarLevel)
}

const iconURL = `url(${getIconURL(props.unit.data.icon)})`
</script>

<template>
<div
	class="unit  group"
	:style="{ left: `${currentPosition[0]}%`, top: `${currentPosition[1]}%` }"
	:draggable="!state.isRunning" @dragstart="onDragStart"
>
	<div class="overlay bars">
		<div class="bar">
			<div class="h-full bg-green-500" :style="{ width: `${100 * unit.health / unit.healthMax}%` }" />
		</div>
		<div v-if="unit.data.stats.mana > 0" class="bar bar-small">
			<div class="h-full bg-blue-500" :style="{ width: `${100 * unit.mana / unit.data.stats.mana}%` }" />
		</div>
	</div>
	<!-- <div class="circle" :class="unit.team === 0 ? 'bg-violet-500' : 'bg-rose-500'"> -->
	<div class="circle" :style="{ backgroundImage: iconURL }" :class="unit.team === 0 ? 'border-violet-500' : 'border-rose-500'">
		<span class="group-hover-visible">{{ unit.name }}</span>
	</div>
	<div class="overlay stars">
		<button v-for="starLevel in 3" :key="starLevel" :disabled="state.isRunning" @click="onStar(starLevel)">
			{{ starLevel <= unit.starLevel ? '★' : '☆' }}
		</button>
	</div>
</div>
</template>

<style scoped lang="postcss">
.unit {
	@apply absolute pointer-events-auto;
	width: v-bind(unitSizeX);
	height: v-bind(unitSizeY);
	transform: translate(-50%, -50%);
}
.overlay {
	@apply absolute w-full z-10;
}

.bar {
	@apply w-full bg-white border border-gray-800;
	margin-bottom: -1px;
	height: 0.9vw;
}
.bar-small {
	height: 0.7vw;
}
.stars {
	@apply bottom-0 text-center text-yellow-500;
	font-size: 1.7vw;
}

.circle {
	@apply w-full h-full bg-cover rounded-full border-4 text-white font-medium  text-center;
	@apply flex justify-center items-center;
	font-size: 1.5vw;
	background-position-x: 75%;
}
</style>
