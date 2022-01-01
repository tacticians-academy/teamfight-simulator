<script setup lang="ts">
import '#/assets/main.postcss'

import ManageTeams from '#/components/Sidebar/ManageTeams.vue'
import Synergies from '#/components/Sidebar/Synergies.vue'

import { computed } from 'vue'

import { useStore } from '#/game/board'
import { getDragName, getDragType, onDragOver } from '#/game/dragDrop'
import { getTeamName } from '#/game/boardUtils'

import { SIDEBAR_UNITS } from '#/game/constants'
import { cancelLoop, runLoop } from '#/game/loop'

const { state, deleteItem, deleteUnit, resetGame } = useStore()

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

function onDrop(event: DragEvent) {
	const dragUnit = state.dragUnit
	if (!dragUnit) {
		return
	}
	if (getDragType(event) === 'unit') {
		deleteUnit(dragUnit.startPosition)
	} else {
		const name = getDragName(event)
		if (name != null) {
			deleteItem(name, dragUnit)
		}
	}
}
</script>

<template>
<div class="sidebar  bg-gray-100  flex flex-col">
	<div class="flex-grow overflow-y-scroll" @dragover="onDragOver" @drop="onDrop">
		<div v-if="!state.isRunning" class="flex flex-col">
			<ManageTeams />
		</div>
		<div v-else>
			<div v-if="state.winningTeam !== null" class="flex justify-center">
				<div :class="state.winningTeam === 0 ? 'text-violet-500' : 'text-rose-500'">{{ getTeamName(state.winningTeam) }} team won!</div>
			</div>
			<Synergies />
		</div>
	</div>
	<button :disabled="!canToggleSimulation" class="button  flex-shrink-0" @click="onFight">{{ state.isRunning ? (state.winningTeam !== null ? 'Reset' : 'Ceasefire') : 'Teamfight!' }}</button>
</div>
</template>

<style lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_UNITS);
}

.sidebar-icon-container {
	@apply flex flex-wrap;
	padding-left: 0.1vw;
}
.sidebar-icon {
	@apply text-white bg-cover font-semibold  flex justify-center items-center text-center;
	font-size: 1.7vw;
	width: 6.4vw;
	height: 6.4vw;
	margin: 0.3vw 0 0 0.3vw;
	background-position-x: 75%;
}
</style>
