<script setup lang="ts">
import { items } from '#/data/set6/items'

import { useStore } from '#/game/board'
import type { ItemData } from '#/game/types'
import { getIconURL } from '#/helpers/utils'

const { state, startDragging } = useStore()

const itemGroups: [[string, ItemData[]], [string, ItemData[]], [string, ItemData[]]] = [['Combined', []], ['Emblems', []], ['Components', []]]
for (const item of items) {
	let index
	if (item.id < 10) {
		index = 2
	} else if (!item.from.length || item.from.includes(8)) {
		index = 1
	} else {
		index = 0
	}
	itemGroups[index][1].push(item)
}
itemGroups.forEach(group => group[1].sort((a, b) => a.name.localeCompare(b.name)))

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'item', name, null)
}
</script>

<template>
<div
	v-for="itemGroup in itemGroups" :key="itemGroup[0]"
	:draggable="!state.isRunning"
>
	<div class="font-semibold">{{ itemGroup[0] }}</div>
	<div class="sidebar-icon-container">
		<div
			v-for="item in itemGroup[1]" :key="item.name"
			class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURL(item.icon)})` }"
			:draggable="!state.isRunning" @dragstart="onDrag($event, item.name)"
		>
			<div class="group-hover-visible  break-words w-full">{{ item.name }}</div>
		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.group-hover-visible {
	font-size: 1.4vw;
}
</style>
