<script setup lang="ts">
import ManageTeams from '#/ui/components/Sidebar/ManageTeams.vue'
import RolldownSetup from '#/ui/components/Sidebar/RolldownSetup.vue'
import SelectPlayers from '#/ui/components/Sidebar/SelectPlayers.vue'

import { computed } from 'vue'

import { useStore } from '#/store/store'
import type { SimMode } from '#/store/store'

import { cancelLoop, runLoop } from '#/sim/loop'

import { SIDEBAR_UNITS } from '#/ui/helpers/constants'
import { onDragOver, onDropSell } from '#/ui/helpers/dragDrop'
import { getTeamName } from '#/ui/helpers/utils'

const SIDEBAR_VW = `${SIDEBAR_UNITS}vw`
const MODE_PANEL_VW = `${SIDEBAR_UNITS / 5}vw`

const { state, resetGame } = useStore()

const canToggleSimulation = computed(() => {
	if (state.didStart) {
		return true
	}
	if (!state.loadedSet) {
		return false
	}
	return state.units.some(unit => unit.team === 0) && state.units.some(unit => unit.team === 1)
})

function onFight() {
	state.didStart = !state.didStart
	state.winningTeam = null
	if (state.didStart) {
		runLoop(true)
	} else {
		cancelLoop()
		resetGame()
	}
}

function onToggle(name: SimMode) {
	if (state.didStart) {
		onFight()
	}
	state.rolldownActive = false
	state.simMode = name
}
</script>

<template>
<div class="sidebar  bg-secondary flex-shrink-0  flex">
	<div class="mode-panel  bg-tertiary  pt-4 space-y-4 flex-shrink-0  flex flex-col text-center">
		<div class="text-secondary">TFT<br>Sim</div>
		<button :disabled="state.simMode === 'teamfight'" class="hover:bg-quaternary disabled:bg-secondary" @click="onToggle('teamfight')">
			Team Fight
		</button>
		<button :disabled="state.simMode === 'rolldown'" class="hover:bg-quaternary disabled:bg-secondary" @click="onToggle('rolldown')">
			Roll Down
		</button>
	</div>
	<div class="flex-grow  flex flex-col h-full justify-between" @dragover="onDragOver" @drop="onDropSell">
		<RolldownSetup v-if="state.simMode === 'rolldown'" />
		<template v-else>
			<div v-if="!state.didStart" class="overflow-y-scroll flex flex-col">
				<ManageTeams />
			</div>
			<div v-else class="overflow-y-scroll">
				<div class="text-center">
					⏱ {{ state.elapsedSeconds }}
				</div>
				<div v-if="state.winningTeam !== null" class="flex justify-center">
					<div :class="state.winningTeam === 0 ? 'text-team-a' : 'text-team-b'">{{ getTeamName(state.winningTeam) }} team won!</div>
				</div>
				<SelectPlayers />
			</div>
			<button :disabled="!canToggleSimulation" class="button  flex-shrink-0" @click="onFight">{{ state.didStart ? (state.winningTeam !== null ? 'Reset' : 'Ceasefire') : 'Teamfight!' }}</button>
		</template>
	</div>
</div>
</template>

<style lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_VW);
	overflow: hidden;
}

.mode-panel {
	width: v-bind(MODE_PANEL_VW);
}
.mode-panel > * {
	@apply aspect-square;
	font-size: 1.3vw;
}
.mode-panel button {
	@apply rounded-l-2xl;
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
}
.sidebar-icon.unit {
	background-position-x: 85%;
	background-size: 200% 112.5%;
}
.icon-name {
	@apply break-words w-full max-h-full leading-tight;
	text-shadow: 0 1px 2px black;
}
</style>
