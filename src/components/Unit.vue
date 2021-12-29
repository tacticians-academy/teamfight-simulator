<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { UnitData } from '#/game/unit'
import { BOARD_COL_COUNT, BOARD_UNITS_RAW, BOARD_ROW_COUNT, HEX_BORDER_PROPORTION, HEX_SIZE_PROPORTION, UNIT_SIZE_HEX_PROPORTION } from '#/game/constants'

import { useStore } from '#/game/board'

const { state, dragUnit } = useStore()

const props = defineProps<{
	unit: UnitData
}>()

const localProportion = 0.8
const hexBorderLocalProportionX = HEX_BORDER_PROPORTION / 0.82
const hexBorderLocalProportionY = HEX_BORDER_PROPORTION / 0.85
const unitInset = (1 - UNIT_SIZE_HEX_PROPORTION) / 2 * HEX_SIZE_PROPORTION

const currentPosition = computed(() => {
	const [col, row] = props.unit.currentPosition()
	const isInsetRow = row % 2 === 1
	const x = unitInset + BOARD_UNITS_RAW * ((col + (isInsetRow ? 0.5 : 0)) / (BOARD_COL_COUNT + 0.5)) + (hexBorderLocalProportionX * (col + (isInsetRow ? 1.5 : 1)))
	const y = unitInset + BOARD_UNITS_RAW * ((row * localProportion) / BOARD_ROW_COUNT) + (hexBorderLocalProportionY * (row + 1)) + 0
	return [x, y]
})

const unitSize = `${UNIT_SIZE_HEX_PROPORTION * HEX_SIZE_PROPORTION}vw`

function onDragStart(event: DragEvent) {
	dragUnit(event, props.unit)
}
</script>

<template>
<div
	class="unit"
	:style="{ left: `${currentPosition[0]}vw`, top: `${currentPosition[1]}vw` }"
	:draggable="!state.isFighting" @dragstart="onDragStart"
>
	<div class="bars">
		<div class="bar">
			<div class="h-full bg-green-500" :style="{ width: `${100 * unit.health / unit.stats.health}%` }" />
		</div>
		<div v-if="unit.stats.ability.manaMax > 0" class="bar bar-small">
			<div class="h-full bg-blue-500" :style="{ width: `${100 * unit.mana / unit.stats.ability.manaMax}%` }" />
		</div>
	</div>
	<div class="circle" :class="unit.team === 0 ? 'bg-violet-500' : 'bg-rose-500'">
		{{ unit.name }}
	</div>
</div>
</template>

<style scoped lang="postcss">
.unit {
	@apply absolute pointer-events-auto;
	width: v-bind(unitSize);
	height: v-bind(unitSize);
}
.bars {
	@apply absolute z-10;
	width: v-bind(unitSize);
	height: 0.8vw;
}
.bar {
	@apply w-full bg-white border border-gray-800;
	margin-bottom: -1px;
	height: 0.8vw;
}
.bar-small {
	height: 0.7vw;
}

.circle {
	@apply w-full h-full  flex justify-center items-center;
	clip-path: circle(50%);
	font-size: 1.5vw;
}
</style>
