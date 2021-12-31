<script setup lang="ts">
import '#/assets/main.postcss'

import { useStore } from '#/game/board'
const { state, deleteUnit, resetGame } = useStore()

import ManageTeams from '#/components/Sidebar/ManageTeams.vue'

import { SIDEBAR_UNITS } from '#/game/constants'
import { cancelLoop, runLoop } from '#/game/loop'
import { computed } from 'vue'

const canToggleSimulation = computed(() => {
	return state.isRunning || (state.units.find(unit => unit.team === 0) && state.units.find(unit => unit.team === 1))
})

function onFight() {
	state.isRunning = !state.isRunning
	state.winningTeam = null
	if (state.isRunning) {
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
<div class="sidebar  bg-gray-100  flex flex-col">
	<div class="flex-grow overflow-y-scroll" @dragover="onDragOver" @drop="onDrop">
		<div v-if="!state.isRunning" class="p-1 flex flex-col">
			<ManageTeams />
		</div>
		<div v-else-if="state.winningTeam !== null" class="flex justify-center">
			<div :class="state.winningTeam === 0 ? 'text-violet-500' : 'text-rose-500'">{{ state.winningTeam === 0 ? 'Blue' : 'Red' }} team won!</div>
		</div>
	</div>
	<button :disabled="!canToggleSimulation" class="button  flex-shrink-0" @click="onFight">{{ state.isRunning ? (state.winningTeam !== null ? 'Reset' : 'Ceasefire') : 'Teamfight!' }}</button>
</div>
</template>

<style scoped lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_UNITS);
}
</style>
