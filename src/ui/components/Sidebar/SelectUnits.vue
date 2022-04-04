<script setup lang="ts">
import { computed } from 'vue'

import type { ChampionData } from '@tacticians-academy/academy-library'

import { useStore, state, setData } from '#/store/store'

import { getIconURLFor } from '#/ui/helpers/utils'

const { startDragging } = useStore()

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'unit', name, null)
}

const unitGroups = computed(() => {
	let unitGroups: ['Supported' | 'Unimplemented', ChampionData[]][] = [['Supported', []], ['Unimplemented', []]]
	setData.champions.forEach(champion => {
		if (champion.teamSize === 0 || champion.stats.hp == null) { return }
		const groupIndex = !champion.traits.length || setData.championEffects[champion.name] != null ? 0 : 1
		unitGroups[groupIndex][1].push(champion)
	})
	unitGroups = unitGroups.filter(group => group[1].length)
	return unitGroups
})
</script>

<template>
<div v-for="[title, group] in unitGroups" :key="title" class="sidebar-icons-group">
	<div v-if="unitGroups.length > 1 || title !== 'Supported'" class="font-semibold">{{ title }}</div>
	<div class="sidebar-icons-container">
		<div
			v-for="unit in group" :key="unit.name"
			class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURLFor(state, unit)})` }"
			:draggable="!state.didStart" @dragstart="onDrag($event, unit.name)"
		>
			<span class="sidebar-icon-name  group-hover-visible">{{ unit.name }}</span>
		</div>
	</div>
</div>
</template>
