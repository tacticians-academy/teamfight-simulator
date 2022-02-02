<script setup lang="ts">
import { champions } from '#/data/set6/champions'

import { useStore } from '#/game/store'

import { getIconURL } from '#/helpers/utils'
import type { ChampionData } from '#/helpers/types'

const { state, startDragging } = useStore()

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'unit', name, null)
}

const unitGroups: [[string, ChampionData[]], [string, ChampionData[]]] = [['Champions', []], ['Spawns', []]]
champions.forEach(champion => {
	unitGroups[champion.traits.length ? 0 : 1][1].push(champion)
})
unitGroups[0][1].sort((a, b) => a.name.localeCompare(b.name))
unitGroups[1][1].sort((a, b) => b.cost - a.cost)
</script>

<template>
<div>
	<div v-for="[title, group] in unitGroups" :key="title">
		<div class="font-semibold">{{ title }}</div>
		<div class="flex flex-wrap">
			<div
				v-for="unit in group" :key="unit.name"
				class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURL(unit)})` }"
				:draggable="!state.isRunning" @dragstart="onDrag($event, unit.name)"
			>
				<span class="group-hover-visible  break-words w-full">{{ unit.name }}</span>
			</div>
		</div>
	</div>
</div>
</template>
