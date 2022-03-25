<script setup lang="ts">
import type { ItemData } from '@tacticians-academy/academy-library'

import { computed } from 'vue'

import { setData, state, useStore } from '#/game/store'

import { getIconURLFor } from '#/helpers/utils'

const { startDragging } = useStore()

const IGNORE_ITEMS = [88]

const itemGroups = computed(() => {
	const itemGroups: [string, ItemData[]][] = [['Combined', setData.completedItems.filter(item => !IGNORE_ITEMS.includes(item.id))], ['Emblems', setData.spatulaItems], ['Components', setData.componentItems]]
	itemGroups.forEach(group => group[1].sort((a, b) => a.name.localeCompare(b.name)))
	return itemGroups
})

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'item', name, null)
}
</script>

<template>
<div
	v-for="[title, group] in itemGroups" :key="title"
	:draggable="!state.isRunning"
	class="sidebar-icons-group"
>
	<div class="font-semibold">{{ title }}</div>
	<div class="sidebar-icons-container">
		<div
			v-for="item in group" :key="item.name"
			class="sidebar-icon  group" :style="{ backgroundImage: state.loadedSetNumber ? `url(${getIconURLFor(state, item)})` : undefined }"
			:draggable="!state.isRunning" @dragstart="onDrag($event, item.name)"
		>
			<div class="sidebar-icon-name  group-hover-visible">{{ item.name }}</div>
		</div>
	</div>
</div>
</template>
