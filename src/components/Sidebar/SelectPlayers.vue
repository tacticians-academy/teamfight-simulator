<script setup lang="ts">
import DisplayTrait from '#/components/Sidebar/DisplayTrait.vue'

import { ref } from 'vue'

import { getIconURL } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { activeAugments } from '@tacticians-academy/academy-library/dist/set6/augments'

import { useStore, setAugmentFor } from '#/game/store'

import { getTeamName } from '#/helpers/boardUtils'
import { clearUnits } from '#/helpers/storage'
import { MutantType } from '#/helpers/types'
import type { TeamNumber } from '#/helpers/types'

const { getters: { synergiesByTeam }, state } = useStore()

function onReset() {
	const confirmed = window.confirm('Clear all units from board?')
	if (confirmed) {
		clearUnits()
	}
}

const selectAugment = ref<[tier: number | null, teamNumber: TeamNumber, augmentIndex: number] | null>(null)

function onAugmentTeamIndex(teamNumber: TeamNumber, augmentIndex: number) {
	selectAugment.value = [null, teamNumber, augmentIndex]
}
function onAugment(augment: AugmentData | null) {
	const [tier, teamIndex, augmentIndex] = selectAugment.value!
	setAugmentFor(teamIndex, augmentIndex, augment)
	selectAugment.value = null
}
</script>

<template>
<div class="p-1">
	<form>
		<fieldset :disabled="state.isRunning">
			<div>
				<label for="select-stage" class="mr-1">Stage:</label>
				<select id="select-stage" v-model="state.stageNumber">
					<option v-for="stageNumber in 9" :key="stageNumber">{{ stageNumber }}</option>
				</select>
			</div>
			<div>
				<label for="select-mutant" class="mr-1">Mutants:</label>
				<select id="select-mutant" v-model="state.mutantType" class="w-full">
					<option v-for="type in MutantType" :key="type">{{ type }}</option>
				</select>
			</div>
			<div v-if="!state.isRunning && state.units.length">
				<button class="px-3 h-8 my-2 bg-quaternary rounded-full" @click.prevent="onReset">Reset board...</button>
			</div>
		</fieldset>
	</form>
	<div class="">
		Augments:
		<div class="flex justify-between">
			<div v-for="(augments, teamNumber) in state.augmentsByTeam" :key="teamNumber" class="w-1/2 flex flex-col items-center">
				<div class="w-full text-secondary">{{ teamNumber === 0 ? 'Blue' : 'Red' }}:</div>
				<button
					v-for="(augment, augmentIndex) in augments" :key="augmentIndex"
					class="sidebar-icon  group" :style="{ backgroundImage: augment ? `url(${getIconURL(augment)})` : undefined }"
					@click="onAugmentTeamIndex(teamNumber as TeamNumber, augmentIndex)"
				>
					<span v-if="augment" class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
					<span v-else class="w-full h-full rounded text-secondary text-xl font-medium font-serif border border-gray-400  flex justify-center items-center">{{ Array(augmentIndex + 1).fill('I').join('') }}</span>
				</button>
			</div>
		</div>
	</div>
	<template v-if="state.units.length">
		<div v-for="(teamSynergies, teamIndex) in synergiesByTeam" :key="teamIndex">
			<div class="font-semibold">Team {{ getTeamName(teamIndex) }}</div>
			<div v-for="{ key, trait, activeStyle, activeEffect, uniqueUnitNames } in teamSynergies" :key="key">
				<DisplayTrait v-if="activeStyle > 0" :trait="trait" :activeStyle="activeStyle" :activeEffect="activeEffect" :units="uniqueUnitNames" />
			</div>
			<div class="text-secondary text-sm">
				<template v-for="{ key, trait, activeStyle } in teamSynergies" :key="key">
					<span v-if="activeStyle === 0">{{ trait.name }}, </span>
				</template>
			</div>
		</div>
	</template>
	<div v-if="selectAugment" class=" absolute inset-0 z-50">
		<div class="overflow-y-scroll bg-gray-800/75  flex flex-col justify-center items-center">
			<div>
				<button
					v-for="(tier, tierIndex) in ['Silver', 'Gold', 'Prismatic']" :key="tierIndex"
					class="w-20 h-16 text-white"
					@click="selectAugment![0] = tierIndex"
				>
					{{ tier }}
				</button>
				<button class="w-20 h-16 text-gray-400" @click="onAugment(null)">Clear</button>
			</div>
			<div v-if="selectAugment[0] != null" class="mb-8  flex flex-wrap justify-center">
				<button
					v-for="augment in activeAugments.filter(a => a.tier - 1 === selectAugment![0])" :key="augment.name"
					class="augment-box  group" :style="{ backgroundImage: augment ? `url(${getIconURL(augment)})` : undefined }"
					@click="onAugment(augment)"
				>
					<span class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
				</button>
			</div>
		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.augment-box {
	@apply w-24 h-24 m-1 rounded-lg bg-cover text-white font-bold text-center  flex justify-center items-center;
  text-shadow: 0 1px 2px black;
}

.sidebar-icon {
	@apply mb-1;
	width: 9vw !important;
	height: 9vw !important;
}
</style>
