<script setup lang="ts">
import { champions } from '#/data/set6/champions'

import { useStore } from '#/game/board'
import { getIconURL } from '#/helpers/utils'

const { state, dragUnit } = useStore()

function onDrag(event: DragEvent, name: string) {
	dragUnit(event, name)
}

const sortedChampions = [...champions].sort((a, b) => a.name.localeCompare(b.name))
</script>

<template>
<div class="flex flex-wrap">
	<div
		v-for="unit in sortedChampions" :key="unit.name"
		class="unit  group" :style="{ backgroundImage: `url(${getIconURL(unit.icon)})` }"
		:draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)"
	>
		<span class="invisible group-hover:visible">{{ unit.name }}</span>
	</div>
</div>
</template>

<style scoped lang="postcss">
.unit {
	@apply text-white bg-cover bg-right  flex justify-center items-center text-center;
	font-size: 1.7vw;
	width: 6.6vw;
	height: 6.6vw;
	margin: 0.2vw 0 0 0.2vw;
}
</style>
