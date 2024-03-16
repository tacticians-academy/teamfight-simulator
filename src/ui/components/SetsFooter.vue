<script setup lang="ts">
import { SET_DATA, SET_NUMBERS, type SetNumber } from '@tacticians-academy/academy-library'

import { state, setSetNumber, DEFAULT_SET } from '#/store/store'
import { computed } from 'vue'

function onSetNumber(set: SetNumber) {
	setSetNumber(set)
}

const currentMilestoneID = computed(() => SET_DATA[state.setNumber].milestoneID)
</script>

<template>
<footer class="w-fit m-auto relative z-10">
	<div v-show="state.simMode === 'teamfight' || !state.didStart" class="flex justify-center items-center">
		<button
			v-for="set in SET_NUMBERS" :key="set"
			class="set-button" :class="state.setNumber === set ? 'bg-quaternary text-inverted' : 'text-tertiary' + (set !== DEFAULT_SET && !SET_DATA[set].milestoneID ? ' opacity-50' : '')"
			:disabled="state.didStart || !state.loadedSet"
			@click="onSetNumber(set)"
		>
			{{ set }}
		</button>
	</div>
	<div v-if="state.simMode === 'teamfight'" class="mt-2 text-tertiary  flex justify-center space-x-1">
		<a href="https://github.com/tacticians-academy/teamfight-simulator" target="_blank">GitHub</a>
		<span>・</span>
		<template v-if="currentMilestoneID">
			<a :href="`https://github.com/tacticians-academy/teamfight-simulator/milestone/${currentMilestoneID}?closed=1`" target="_blank">{{ state.setNumber }} progress</a>
			<span>・</span>
		</template>
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
