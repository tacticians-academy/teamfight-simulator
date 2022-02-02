<script setup lang="ts">
import Unit from '#/components/Unit.vue'

import { onMounted, ref } from 'vue'

import { useStore } from '#/game/store'
import { getDragNameOf, onDragOver } from '#/game/dragDrop'

import { BOARD_ROW_PER_SIDE_COUNT, HALF_HEX_UNITS, HALF_HEX_BORDER_UNITS, HEX_BORDER_UNITS, HEX_UNITS, QUARTER_HEX_INSET_UNITS } from '#/helpers/constants'

const hexContainer = ref<HTMLElement | null>(null)

const { state, dropUnit, loadUnits } = useStore()

function onDrop(event: DragEvent, row: number, col: number) {
	const championName = getDragNameOf('unit', event)
	if (championName == null) {
		return
	}
	event.preventDefault()
	dropUnit(event, championName, [col, row])
}

onMounted(() => {
	// Cache hex positions
	const container = hexContainer.value!
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

	loadUnits()
})
</script>

<template>
<div class="board  overflow-y-scroll">
	<div class="relative">
		<div ref="hexContainer" class="row-container">
			<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
				<div
					v-for="(col, colIndex) in row" :key="colIndex"
					class="hex" :class="rowIndex < BOARD_ROW_PER_SIDE_COUNT ? 'team-a' : 'team-b'"
					@dragover="onDragOver" @drop="onDrop($event, rowIndex, colIndex)"
				/>
			</div>
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
	@apply relative w-full overflow-x-hidden;
}

.row {
	@apply relative  flex;
	margin-bottom: v-bind(QUARTER_HEX_INSET_UNITS);
}
.row:last-child {
	margin-bottom: v-bind(HEX_BORDER_UNITS);
}
.row-alt {
	left: v-bind(HALF_HEX_UNITS);
	margin-left: v-bind(HALF_HEX_BORDER_UNITS);
}

.hex {
	@apply bg-gray-200;
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
