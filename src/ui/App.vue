<script setup lang="ts">
import '#/ui/assets/main.postcss'

import Board from '#/ui/components/Board.vue'
import Sidebar from '#/ui/components/Sidebar/Sidebar.vue'

import type { SetNumber } from '@tacticians-academy/academy-library'

import { DEFAULT_SET, state, setSetNumber } from '#/store/store'

const selectableSetNumbers: SetNumber[] = [1, 6, 6.5]
if (!selectableSetNumbers.includes(DEFAULT_SET)) {
	selectableSetNumbers.push(DEFAULT_SET)
}

function onSetNumber(set: SetNumber) {
	setSetNumber(set)
}
</script>

<template>
<div class="h-full  flex">
	<Sidebar />
	<div class="relative w-full h-full overflow-y-scroll">
		<Board />
		<footer class="relative z-10">
			<div class="flex justify-center items-center space-x-2">
				<span class="text-tertiary uppercase font-light">set</span>
				<button
					v-for="set in selectableSetNumbers" :key="set"
					class="w-8 h-8 rounded-lg font-bold" :class="state.setNumber === set ? 'bg-quaternary text-inverted' : 'text-tertiary border-2 border-quaternary'"
					:disabled="state.didStart || !state.loadedSet"
					@click="onSetNumber(set)"
				>
					{{ set }}
				</button>
			</div>
			<div class="mt-2 text-tertiary  flex justify-center space-x-1">
				<a href="https://github.com/tacticians-academy/teamfight-simulator" target="_blank">GitHub</a>
				<span>・</span>
				<a href="https://github.com/tacticians-academy/teamfight-simulator/milestone/1?closed=1" target="_blank">6.5 progress</a>
				<span>・</span>
				<a :href="`mailto:tacticians.academy@gmail.com?subject=${encodeURIComponent('Teamfight Simulator Feedback')}`" target="_blank">Send feedback</a>
			</div>
		</footer>
	</div>
</div>
</template>

<style scoped lang="postcss">
footer {
	margin-top: -11vw;
}
</style>
