<script setup lang="ts">
import { allUnits } from '#/game/data/set6/units'

import { useStore } from '#/game/board'

const { state, dragUnit } = useStore()

function onDrag(event: DragEvent, name: string) {
	dragUnit(event, name)
}
</script>

<template>
<div v-for="unit in allUnits" :key="unit.name" :draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)">
	{{ unit.name }}
</div>
</template>
