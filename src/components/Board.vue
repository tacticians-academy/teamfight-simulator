<script setup lang="ts">
import Unit from '#/components/Unit.vue'

import { useStore } from '#/game/board'
import { BOARD_ROW_PER_SIDE_COUNT, HALF_HEX_UNITS, HALF_HEX_BORDER_UNITS, HEX_BORDER_UNITS, HEX_UNITS, QUARTER_HEX_INSET_UNITS } from '#/game/constants'

const { state, replaceUnit } = useStore()

function onDragOver(event: DragEvent) {
	if (event.dataTransfer?.items.length !== 1) {
		return
	}
	event.preventDefault()
}
function onDrop(event: DragEvent, row: number, col: number) {
	const championName = event.dataTransfer?.getData('text')
	if (championName == null || !championName.length) {
		return
	}
	event.preventDefault()
	replaceUnit(state.dragUnit ?? championName, [col, row])
}
</script>

<template>
<div class="board">
	<div class="absolute">
		<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
			<!-- <div v-if="rowIndex === BOARD_ROW_PER_SIDE_COUNT" class="board-separator" /> -->
			<div
				v-for="(col, colIndex) in row" :key="col"
				class="hex" :class="rowIndex < BOARD_ROW_PER_SIDE_COUNT ? 'team-a' : 'team-b'"
				@dragover="onDragOver" @drop="onDrop($event, rowIndex, colIndex)"
			/>
		</div>
	</div>
	<div class="absolute inset-0 pointer-events-none">
		<Unit
			v-for="unit in state.units" :key="unit.name + unit.startPosition"
			:data="unit"
		/>
	</div>
</div>
</template>

<style scoped lang="postcss">
.board {
	@apply relative w-full;
}

.row {
	@apply relative  flex;
	margin-bottom: v-bind(QUARTER_HEX_INSET_UNITS);
}
.row:last-child {
	margin-bottom: v-bind(HEX_BORDER_UNITS);
}

.row-alt {
	@apply relative;
	left: v-bind(HALF_HEX_UNITS);
	margin-left: v-bind(HALF_HEX_BORDER_UNITS);
}

/* .board-separator {
	@apply absolute -z-10 w-full h-8 bg-gray-400;
	height: 3vw;
} */

.hex {
	@apply relative bg-gray-200;
	width: v-bind(HEX_UNITS);
	height: v-bind(HEX_UNITS);
	margin: v-bind(HEX_BORDER_UNITS) 0 0 v-bind(HEX_BORDER_UNITS);
	clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
}
.hex.team-a {
	@apply bg-blue-100;
}
.hex.team-b {
	@apply bg-red-100;
}
</style>
