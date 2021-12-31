<script setup lang="ts">
import { champions } from '#/data/set6/champions'

import { useStore } from '#/game/board'

const { state, dragUnit } = useStore()

function onDrag(event: DragEvent, name: string) {
	dragUnit(event, name)
}

const sortedChampions = [...champions].sort((a, b) => a.name.localeCompare(b.name))
</script>

<template>
<div v-for="unit in sortedChampions" :key="unit.name" :draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)">
	{{ unit.name }}
</div>
</template>
