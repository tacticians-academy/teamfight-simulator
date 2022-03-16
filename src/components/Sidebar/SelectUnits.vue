<script setup lang="ts">
import { getIconURL } from '@tacticians-academy/academy-library'
import type { ChampionData } from '@tacticians-academy/academy-library'

import { champions } from '@tacticians-academy/academy-library/dist/set6/champions'

import { useStore } from '#/game/store'

const { state, startDragging } = useStore()

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'unit', name, null)
}

const unitGroups: [[string, ChampionData[]], [string, ChampionData[]]] = [['Champions', []], ['Spawns', []]]
champions.forEach(champion => {
	if (champion.teamSize === 0 || champion.stats.hp == null) { return }
	unitGroups[champion.traits.length ? 0 : 1][1].push(champion)
})
unitGroups[0][1].sort((a, b) => a.name.localeCompare(b.name))
unitGroups[1][1].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
</script>

<template>
<div v-for="[title, group] in unitGroups" :key="title" class="sidebar-icons-group">
	<div class="font-semibold">{{ title }}</div>
	<div class="sidebar-icons-container">
		<div
			v-for="unit in group" :key="unit.name"
			class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURL(unit)})` }"
			:draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)"
		>
			<span class="sidebar-icon-name  group-hover-visible">{{ unit.name }}</span>
		</div>
	</div>
</div>
</template>
