<script setup lang="ts">
import { state } from '#/game/board'
</script>

<template>
<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
	<div v-for="col in row" :key="col" class="hex" />
</div>
</template>

<style scoped lang="postcss">
.row {
	@apply flex;
	margin-bottom: -3vw;
}
.row-alt {
	transform: translate(6vw);
	margin-left: 0.25vw;
}

.hex {
	@apply relative bg-gray-200;
	width: 12vw;
	height: 12vw;
	margin: 0.5vw 0 0 0.5vw;
	clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
}
</style>
