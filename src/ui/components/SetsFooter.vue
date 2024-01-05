<script setup lang="ts">
import { SET_NUMBERS, type SetNumber } from '@tacticians-academy/academy-library'

import { state, setSetNumber } from '#/store/store'

const implementedSetNumbers: SetNumber[] = [6.5, 10]

function onSetNumber(set: SetNumber) {
	setSetNumber(set)
}
</script>

<template>
<footer class="w-fit m-auto relative z-10">
	<div v-show="state.simMode === 'teamfight' || !state.didStart" class="flex justify-center items-center">
		<span class="text-tertiary uppercase font-light mr-1 max-lg:text-xs">set</span>
		<button
			v-for="set in SET_NUMBERS" :key="set"
			class="set-button" :class="state.setNumber === set ? 'bg-quaternary text-inverted' : 'text-tertiary' + (!implementedSetNumbers.includes(set) ? ' opacity-50' : '')"
			:disabled="state.didStart || !state.loadedSet"
			@click="onSetNumber(set)"
		>
			{{ set }}
		</button>
	</div>
	<div v-if="state.simMode === 'teamfight'" class="mt-2 text-tertiary  flex justify-center space-x-1">
		<a href="https://github.com/tacticians-academy/teamfight-simulator" target="_blank">GitHub</a>
		<span>・</span>
		<a href="https://github.com/tacticians-academy/teamfight-simulator/milestone/1?closed=1" target="_blank">6.5 progress</a>
		<span>・</span>
		<a :href="`mailto:tacticians.academy@gmail.com?subject=${encodeURIComponent('Teamfight Simulator Feedback')}`" target="_blank">Send feedback</a>
	</div>
</footer>
</template>

<style scoped lang="postcss">
footer {
	margin-top: -11vw;
}
.set-button {
	@apply w-8 h-8 font-semibold rounded-lg;
	@apply max-lg:w-5 max-lg:h-5 max-lg:text-xs max-lg:rounded-md;
}
</style>
