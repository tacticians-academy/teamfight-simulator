<script setup lang="ts">
import Unit from '#/components/Unit.vue'

import { useStore } from '#/game/board'
import { getDragNameOf, onDragOver } from '#/game/dragDrop'
import { BOARD_ROW_PER_SIDE_COUNT, HALF_HEX_UNITS, HALF_HEX_BORDER_UNITS, HEX_BORDER_UNITS, HEX_UNITS, QUARTER_HEX_INSET_UNITS } from '#/game/constants'
import { onMounted, ref } from 'vue'

const rowContainer = ref<HTMLElement | null>(null)

const { state, copyUnit, moveUnit } = useStore()

function onDrop(event: DragEvent, row: number, col: number) {
	const championName = getDragNameOf('unit', event)
	if (championName == null) {
		return
	}
	event.preventDefault()
	if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
		copyUnit(state.dragUnit, [col, row])
	} else {
		moveUnit(state.dragUnit ?? championName, [col, row])
	}
}

onMounted(() => {
	const container = rowContainer.value!
	const containerWidth = container.offsetWidth
	const containerHeight = container.offsetHeight
	const rows = Array.from(container.children) as HTMLElement[]
	state.hexProportionX = rows[0].children[0].clientWidth / containerWidth
	state.hexProportionY = rows[0].children[0].clientHeight / containerHeight
	for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
		const row = rows[rowIndex]
		const cols = Array.from(row.children) as HTMLElement[]
		for (let colIndex = 0; colIndex < cols.length; colIndex += 1) {
			const col = cols[colIndex]
			const hexWidthHalf = col.offsetWidth / 2
			const x = row.offsetLeft + col.offsetLeft + hexWidthHalf
			const y = row.offsetTop + col.offsetTop + hexWidthHalf
			state.hexRowsCols[rowIndex][colIndex].position = [x / containerWidth, y / containerHeight]
		}
	}
})
</script>

<template>
<div class="board  overflow-y-scroll">
	<div ref="rowContainer" class="relative">
		<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
			<!-- <div v-if="rowIndex === BOARD_ROW_PER_SIDE_COUNT" class="board-separator" /> -->
			<div
				v-for="(col, colIndex) in row" :key="colIndex"
				class="hex" :class="rowIndex < BOARD_ROW_PER_SIDE_COUNT ? 'team-a' : 'team-b'"
				@dragover="onDragOver" @drop="onDrop($event, rowIndex, colIndex)"
			/>
		</div>
		<div class="absolute inset-0 pointer-events-none">
			<template v-for="unit in state.units" :key="unit.name + unit.startPosition">
				<Unit v-if="!unit.dead" :unit="unit" />
			</template>
		</div>
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
	@apply bg-violet-100;
}
.hex.team-b {
	@apply bg-rose-100;
}
</style>
