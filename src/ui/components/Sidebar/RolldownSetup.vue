<script setup lang="ts">
import DisplayTrait from '#/ui/components/Sidebar/DisplayTrait.vue'

import type { ItemData } from '@tacticians-academy/academy-library'

import { useStore, setData } from '#/store/store'
import { getIconURLFor } from '#/ui/helpers/utils'
import type { RolldownConfig } from '#/sim/data/types'
import { getValueOfTeam } from '#/sim/helpers/effectUtils'
import { getItemByIdentifier } from '#/sim/helpers/utils'

const { getters: { isBoardEnabled, synergiesByTeam }, state, startDragging, setCompForTeam, resetShop } = useStore()

let rolldownStartMS = performance.now()
let rolldownTimer: ReturnType<typeof setTimeout> | undefined = undefined

const ROLLDOWN_SECONDS = 30

function onConfig(config?: RolldownConfig) {
	clearTimer()
	const active = config != null && !state.rolldownActive
	state.rolldownActive = active
	state.didStart = active
	state.elapsedSeconds = 0
	resetShop()
	if (active) {
		rolldownStartMS = performance.now()
		updateTimer()

		state.stageNumber = config.stage
		state.gold = config.gold
		state.xp = config.xp
		state.benchItems = config.items.map(itemID => getItemByIdentifier(itemID, setData.currentItems)).filter((item): item is ItemData => !!item)
		setCompForTeam({ augments: [], units: config.units }, 0)
	}
}

function clearTimer() {
	if (rolldownTimer) {
		clearTimeout(rolldownTimer)
		rolldownTimer = undefined
	}
}

function updateTimer(ms: DOMHighResTimeStamp = 1000) {
	clearTimer()
	rolldownTimer = setTimeout(() => {
		if (state.rolldownActive && state.elapsedSeconds < ROLLDOWN_SECONDS) {
			state.elapsedSeconds += 1
			const elapsedMS = performance.now() - rolldownStartMS
			const driftMS = elapsedMS - state.elapsedSeconds * 1000
			updateTimer(1000 - driftMS)
		} else {
			state.rolldownActive = false
			clearTimer()
		}
	}, ms)
}
</script>

<template>
<div v-if="!state.didStart" class="p-1 space-y-2">
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
		<div class="text-center">
			⏱ {{ ROLLDOWN_SECONDS - state.elapsedSeconds }}
		</div>
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
			:draggable="isBoardEnabled" @dragstart="startDragging($event, 'item', item.name, null)"
		>
			<div class="icon-name  group-hover-visible">{{ item.name }}</div>
		</div>
	</div>
</div>
</template>
