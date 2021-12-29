<script setup lang="ts">
import { allUnits } from '#/game/data/set6/units'

function onDrag(event: DragEvent, name: string) {
	event.dataTransfer?.setData('text', name)
}
</script>

<template>
<div v-for="unit in allUnits" :key="unit.name" draggable="true" @dragstart="onDrag($event, unit.name)">
	{{ unit.name }}
</div>
</template>

<style scoped lang="postcss">
</style>
