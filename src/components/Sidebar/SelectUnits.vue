<script setup lang="ts">
import { champions } from '#/data/set6/champions'

import { useStore } from '#/game/board'
import { getIconURL } from '#/helpers/utils'

const { state, dragUnit } = useStore()

function onDrag(event: DragEvent, name: string) {
	dragUnit(event, name)
}

const sortedChampions = [...champions].sort((a, b) => a.name.localeCompare(b.name))
</script>

<template>
<div class="flex flex-wrap">
	<div
		v-for="unit in sortedChampions" :key="unit.name"
		class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURL(unit.icon)})` }"
		:draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)"
	>
		<span class="group-hover-visible">{{ unit.name }}</span>
	</div>
</div>
</template>
