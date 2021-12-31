<script setup lang="ts">
import { items } from '#/data/set6/items'

import { useStore } from '#/game/board'
import type { ItemData } from '#/game/types'

const { state, dragUnit } = useStore()

const itemGroups: [[string, ItemData[]], [string, ItemData[]], [string, ItemData[]]] = [['Combined', []], ['Components', []], ['Emblems', []]]
for (const item of items) {
	let index
	if (item.id < 10) {
		index = 1
	} else if (item.from.includes(8)) {
		index = 2
	} else {
		index = 0
	}
	itemGroups[index][1].push(item)
}
itemGroups.forEach(group => group[1].sort((a, b) => a.name.localeCompare(b.name)))

function onDrag(event: DragEvent, name: string) {
	console.log(name)
}
</script>

<template>
<div v-for="itemGroup in itemGroups" :key="itemGroup[0]" :draggable="!state.isRunning">
	<div class="font-semibold">{{ itemGroup[0] }}</div>
	<div v-for="item in itemGroup[1]" :key="item.name" :draggable="!state.isRunning" @dragstart="onDrag($event, item.name)">
		{{ item.name }}
	</div>
</div>
</template>
