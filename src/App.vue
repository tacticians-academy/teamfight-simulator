<script setup lang="ts">
import '#/assets/main.postcss'

import Board from '#/components/Board.vue'
import Sidebar from '#/components/Sidebar/Sidebar.vue'

import type { SetNumber } from '@tacticians-academy/academy-library'

import { saveSetNumber } from '#/helpers/storage'

import { state, setSetNumber } from '#/game/store'

const availableSets: SetNumber[] = [1, 6]

function onSetNumber(set: SetNumber) {
	setSetNumber(set)
	saveSetNumber(set)
}
</script>

<template>
<div class="h-full  flex">
	<Sidebar />
	<div class="relative w-full h-full overflow-y-scroll">
		<div class="set-bar  flex justify-center items-center space-x-2">
			<span class="text-secondary uppercase font-light">set</span>
			<button
				v-for="set in availableSets" :key="set"
				class="w-8 h-8 rounded-lg font-bold" :class="state.setNumber === set ? 'bg-gray-400 text-white' : 'text-secondary border-2 border-gray-300'"
				:disabled="state.isRunning || state.loadedSetNumber == null"
				@click="onSetNumber(set)"
			>
				{{ set }}
			</button>
		</div>
		<Board />
	</div>
</div>
</template>

<style scoped lang="postcss">
.set-bar {
	@apply mt-1;
	padding-right: 8vw;
}
</style>
