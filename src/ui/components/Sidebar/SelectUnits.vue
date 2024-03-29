<script setup lang="ts">
import SelectUnitsComp from '#/ui/components/Sidebar/SelectUnitsComp.vue'

import { computed, ref } from 'vue'

import type { ChampionData } from '@tacticians-academy/academy-library'

import { useStore, state, setData, setDataReactive } from '#/store/store'

import { isPlaceable } from '#/sim/ChampionUnit'
import type { CustomComps } from '#/sim/data/types'
import { isEmpty } from '#/sim/helpers/utils'
import { getIconURLFor } from '#/ui/helpers/utils'

const { getters: { isBoardEnabled }, startDragging } = useStore()

const unitGroups = computed(() => {
	let unitGroups: ['Supported' | 'Unimplemented', ChampionData[]][] = [['Supported', []], ['Unimplemented', []]]
	setData.champions
		.filter(unit => isPlaceable(unit))
		.forEach(unit => {
			const groupIndex = !unit.traits.length || setData.championEffects[unit.apiName!] != null ? 0 : 1
			unitGroups[groupIndex][1].push(unit)
		})
	unitGroups = unitGroups.filter(group => group[1].length)
	return unitGroups
})

type SectionName = 'individual' | 'comps'

const showSection = ref<SectionName>('individual')

function onToggle(name: SectionName) {
	showSection.value = name
}

const compsByGroup = computed(() => {
	const compGroups: [string, CustomComps][] = []
	if (!isEmpty(setData.compsDefault)) {
		compGroups.push(['Defaults', setData.compsDefault])
	}
	if (!isEmpty(setDataReactive.compsUser)) {
		compGroups.push(['Yours', setDataReactive.compsUser])
	}
	return compGroups
})
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
				v-for="unit in group" :key="unit.apiName"
				class="sidebar-icon unit  group" :style="{ backgroundImage: `url(${getIconURLFor(state, unit)})` }"
				:draggable="isBoardEnabled" @dragstart="startDragging($event, 'unit', unit.apiName!, null)"
			>
				<span class="icon-name  group-hover-visible">{{ unit.name }}</span>
			</div>
		</div>
	</div>
</template>
<div v-else-if="showSection === 'comps'" class="space-y-4">
	<template v-if="!compsByGroup.length">
		<p class="m-1 text-secondary text-sm text-center italic">
			Preset team compositions created with the "Save Comp" button appear here.
		</p>
	</template>
	<template v-else>
		<div v-for="[title, comps] in compsByGroup" :key="title" class="space-y-1">
			<div class="mt-1 mx-1 text-secondary uppercase text-sm">{{ title }}:</div>
			<template v-for="(comp, name) in comps" :key="name">
				<SelectUnitsComp :name="name" :comp="comp" :canDelete="title !== 'Defaults'" class="mx-1" />
			</template>
		</div>
	</template>
</div>
</template>
