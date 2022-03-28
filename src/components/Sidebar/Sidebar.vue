<script setup lang="ts">
import '#/assets/main.postcss'

import ManageTeams from '#/components/Sidebar/ManageTeams.vue'
import SelectPlayers from '#/components/Sidebar/SelectPlayers.vue'

import { computed } from 'vue'

import { useStore } from '#/game/store'
import { cancelLoop, runLoop } from '#/game/loop'

import { getTeamName } from '#/helpers/boardUtils'
import { SIDEBAR_UNITS } from '#/helpers/constants'
import { getDragName, getDragType, onDragOver } from '#/helpers/dragDrop'

const { state, deleteItem, deleteUnit, resetGame } = useStore()

const canToggleSimulation = computed(() => {
	return state.isRunning || (state.loadedSetNumber && state.units.some(unit => unit.team === 0) && state.units.some(unit => unit.team === 1))
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

function onDrop(event: DragEvent) {
	const dragUnit = state.dragUnit
	if (!dragUnit) {
		return
	}
	if (getDragType(event) === 'unit') {
		deleteUnit(dragUnit.startHex)
	} else {
		const name = getDragName(event)
		if (name != null) {
			deleteItem(name, dragUnit)
		}
	}
}
</script>

<template>
<div class="sidebar  bg-secondary  flex flex-col">
	<div class="flex-grow overflow-y-scroll" @dragover="onDragOver" @drop="onDrop">
		<div v-if="!state.isRunning" class="flex flex-col">
			<ManageTeams />
		</div>
		<div v-else>
			<div class="text-center">
				⏱ {{ state.elapsedSeconds }}
			</div>
			<div v-if="state.winningTeam !== null" class="flex justify-center">
				<div :class="state.winningTeam === 0 ? 'text-violet-500' : 'text-rose-500'">{{ getTeamName(state.winningTeam) }} team won!</div>
			</div>
			<SelectPlayers />
		</div>
	</div>
	<button :disabled="!canToggleSimulation" class="button  flex-shrink-0" @click="onFight">{{ state.isRunning ? (state.winningTeam !== null ? 'Reset' : 'Ceasefire') : 'Teamfight!' }}</button>
</div>
</template>

<style lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_UNITS);
}

.sidebar-icons-group {
	padding: 0 0.25vw;
}
.sidebar-icons-container {
	@apply flex flex-wrap justify-between;
}
.sidebar-icon {
	@apply text-white bg-cover font-semibold rounded aspect-square;
	@apply flex justify-center items-center text-center;
	font-size: 1.7vw;
	width: calc(33.3333333333% - 0.25vw * 2 / 3);
	margin-bottom: 0.25vw;
	background-position-x: 75%;
}
.sidebar-icon-name {
	@apply break-words w-full max-h-full leading-tight;
	text-shadow: 0 1px 2px black;
}
</style>
