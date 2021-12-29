<script setup lang="ts">
import '#/assets/main.postcss'

import Board from '#/components/Board.vue'
import SelectUnits from '#/components/SelectUnits.vue'

import { SIDEBAR_UNITS } from '#/game/constants'

function onPlay() {
	console.log('todo')
}
</script>

<template>
<div class="h-full  flex">
	<div class="sidebar  overflow-y-scroll bg-gray-100  flex flex-col justify-between">
		<div class="p-1 flex flex-col">
			<SelectUnits />
		</div>
		<button :disabled="true" class="button" @click="onPlay">Fight!</button>
	</div>
	<Board class="overflow-y-scroll" />
</div>
</template>

<style scoped lang="postcss">
.sidebar {
	width: v-bind(SIDEBAR_UNITS);
}
</style>
