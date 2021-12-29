<script setup lang="ts">
import '#/assets/main.postcss'

import { useStore } from '#/game/board'
const { state, resetGame } = useStore()

import SelectUnits from '#/components/SelectUnits.vue'

import { SIDEBAR_UNITS } from '#/game/constants'
import { cancelLoop, runLoop } from '#/game/loop'

function onFight() {
	state.isFighting = !state.isFighting
	if (state.isFighting) {
		runLoop(0)
	} else {
		cancelLoop()
		resetGame()
	}
}
</script>

<template>
<div class="sidebar  bg-gray-100  flex flex-col justify-between">
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
