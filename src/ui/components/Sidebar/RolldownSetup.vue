<script setup lang="ts">
import DisplayTrait from '#/ui/components/Sidebar/DisplayTrait.vue'

import type { ItemData } from '@tacticians-academy/academy-library'

import { useStore, getValueOfTeam, setData, setCompForTeam, resetShop } from '#/store/store'
import { getIconURLFor } from '#/ui/helpers/utils'
import type { RolldownConfig } from '#/sim/data/types'
import { getItemByIdentifier } from '#/sim/helpers/utils'

const { getters: { synergiesByTeam }, state, startDragging } = useStore()

function onConfig(config?: RolldownConfig) {
	const active = config != null && !state.rolldownActive
	state.rolldownActive = active
	resetShop()
	if (active) {
		state.elapsedSeconds = 0
		state.stageNumber = config.stage
		state.gold = config.gold
		state.xp = config.xp
		state.benchItems = config.items.map(itemID => getItemByIdentifier(itemID, setData.currentItems)).filter((item): item is ItemData => !!item)
		setCompForTeam({ augments: [], units: config.units }, 0)
	}
}
</script>

<template>
<div v-if="!state.rolldownActive" class="p-1 space-y-2">
	<h1 class="text-xl">Choose a scenario:</h1>
	<button v-for="(config, index) in setData.rolldownConfigs" :key="index" class="w-full pt-0.5 px-1 bg-tertiary rounded-md group" @click="onConfig(config)">
		<div class="flex space-x-2">
			<div>Stage {{ config.stage }}</div>
			<div>{{ config.gold }}g</div>
			<div>{{ config.xp }}xp</div>
		</div>
		<div class="flex">
			<div
				v-for="unit in config.units" :key="unit.id"
				class="sidebar-icon unit  -mr-1 last:mr-0" :style="{ backgroundImage: `url(${getIconURLFor(state, setData.champions.find(c => c.apiName === unit.id)!)})` }"
			/>
		</div>
		<div class="flex">
			<div
				v-for="itemID in [...config.units.reduce((acc, curr) => acc.concat(curr.items), [] as (string | number)[]), ...config.items]" :key="itemID"
				class="sidebar-icon  -mr-1 last:mr-0" :style="{ backgroundImage: `url(${getIconURLFor(state, getItemByIdentifier(itemID, setData.currentItems)!)})` }"
			/>
		</div>
	</button>
</div>
<div v-else class="h-full  flex flex-col justify-between">
	<div class="flex flex-col">
		<div class="p-1 overflow-y-scroll">
			<div>
				<span class="">Board value: {{ getValueOfTeam(0) }}</span>
			</div>
			<div v-for="{ key, trait, activeStyle, activeEffect, units } in synergiesByTeam[0]" :key="key">
				<DisplayTrait v-if="activeStyle > 0" :trait="trait" :activeStyle="activeStyle" :activeEffect="activeEffect" :units="units" />
			</div>
			<div class="text-secondary text-sm">
				<template v-for="{ key, trait, activeStyle } in synergiesByTeam[0]" :key="key">
					<span v-if="activeStyle === 0">{{ trait.name }}, </span>
				</template>
			</div>
		</div>
		<button class="button  flex-shrink-0" @click="onConfig()">Reset</button>
	</div>
	<div class="sidebar-icons-container   p-1 bg-primary">
		<div
			v-if="!state.benchItems.length"
			class="sidebar-icon  group" :style="{ }"
		/>
		<div
			v-for="item in state.benchItems" :key="item.name"
			class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURLFor(state, item)})` }"
			:draggable="!state.didStart" @dragstart="startDragging($event, 'item', item.name, null)"
		>
			<div class="icon-name  group-hover-visible">{{ item.name }}</div>
		</div>
	</div>
</div>
</template>
