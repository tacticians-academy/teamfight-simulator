<script setup lang="ts">
import '#/assets/main.postcss'

import { useStore } from '#/game/board'
const { state, deleteUnit, resetGame } = useStore()

import SelectUnits from '#/components/SelectUnits.vue'

import { SIDEBAR_UNITS } from '#/game/constants'
import { cancelLoop, runLoop } from '#/game/loop'

function onFight() {
	state.isFighting = !state.isFighting
	if (state.isFighting) {
		runLoop(performance.now())
	} else {
		cancelLoop()
		resetGame()
	}
}

function onDragOver(event: DragEvent) {
	if (event.dataTransfer?.items.length !== 1) {
		return
	}
	event.preventDefault()
}
function onDrop(event: DragEvent) {
	const dragFrom = state.dragUnit?.startPosition
	if (dragFrom) {
		deleteUnit(dragFrom)
	}
}
</script>

<template>
<div class="sidebar  bg-gray-100  flex flex-col justify-between" @dragover="onDragOver" @drop="onDrop">
	<div v-if="!state.isFighting" class="p-1 flex flex-col">
		<SelectUnits />
	</div>
	<button :disabled="!state.isFighting && state.units.length < 2" class="button" @click="onFight">{{ state.isFighting ? 'Peace' : 'Fight!' }}</button>
</div>
</template>

<style scoped lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_UNITS);
}
</style>
