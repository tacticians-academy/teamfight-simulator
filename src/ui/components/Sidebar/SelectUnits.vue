<script setup lang="ts">
import SelectUnitsComp from '#/ui/components/Sidebar/SelectUnitsComp.vue'

import { computed, ref } from 'vue'

import type { ChampionData } from '@tacticians-academy/academy-library'

import { useStore, state, setData } from '#/store/store'

import type { CustomComps } from '#/sim/data/types'
import { getIconURLFor } from '#/ui/helpers/utils'

const { startDragging } = useStore()

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

type SectionName = 'individual' | 'comps'

const showSection = ref<SectionName>('individual')

function onToggle(name: SectionName) {
	showSection.value = name
}

const compsByGroup = computed<[string, CustomComps][]>(() => [
	['Defaults', setData.compsDefault],
	['Yours', setData.compsUser],
])
</script>

<template>
<div class="segmented-control">
	<button :disabled="showSection === 'individual'" @click="onToggle('individual')">
		Individual
	</button>
	<button :disabled="showSection === 'comps'" @click="onToggle('comps')">
		Comps
	</button>
</div>
<template v-if="showSection === 'individual'">
	<div v-for="[title, group] in unitGroups" :key="title" class="sidebar-icons-group">
		<div v-if="unitGroups.length > 1 || title !== 'Supported'" class="font-semibold">{{ title }}</div>
		<div class="sidebar-icons-container">
			<div
				v-for="unit in group" :key="unit.name"
				class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURLFor(state, unit)})` }"
				:draggable="!state.didStart" @dragstart="startDragging($event, 'unit', unit.name, null)"
			>
				<span class="sidebar-icon-name  group-hover-visible">{{ unit.name }}</span>
			</div>
		</div>
	</div>
</template>
<div v-else-if="showSection === 'comps'" class="space-y-4">
	<template v-for="[title, comps] in compsByGroup" :key="title">
		<div v-if="Object.keys(comps).length" class="space-y-1">
			<div class="mt-1 mx-1 text-secondary uppercase text-sm">{{ title }}:</div>
			<template v-for="(comp, name) in comps" :key="name">
				<SelectUnitsComp :name="name" :comp="comp" class="mx-1" />
			</template>
		</div>
	</template>
</div>
</template>
