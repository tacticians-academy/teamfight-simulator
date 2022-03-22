<script setup lang="ts">
import { ref } from 'vue'

import { getIconURL } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { activeAugments } from '@tacticians-academy/academy-library/dist/set6/augments'

import { useStore, setAugmentFor } from '#/game/store'

import type { TeamNumber } from '#/helpers/types'

const { state } = useStore()

const selectAugment = ref<[tierIndex: number, teamNumber: TeamNumber, augmentIndex: number] | null>(null)

function onAugmentTeamIndex(teamNumber: TeamNumber, augmentIndex: number) {
	selectAugment.value = [0, teamNumber, augmentIndex]
}
function onAugment(augment: AugmentData | null) {
	const [tier, teamIndex, augmentIndex] = selectAugment.value!
	setAugmentFor(teamIndex, augmentIndex, augment)
	selectAugment.value = null
}
</script>

<template>
<div class="mb-1">
	Augments:
	<div class="flex justify-between">
		<div v-for="(augments, teamNumber) in state.augmentsByTeam" :key="teamNumber" class="w-1/2 flex flex-col items-center">
			<div class="w-full text-secondary">{{ teamNumber === 0 ? 'Blue' : 'Red' }}:</div>
			<button
				v-for="(augment, augmentIndex) in augments" :key="augmentIndex"
				class="sidebar-icon  group" :style="{ backgroundImage: augment ? `url(${getIconURL(augment)})` : undefined }"
				:disabled="state.isRunning"
				@click="onAugmentTeamIndex(teamNumber as TeamNumber, augmentIndex)"
			>
				<span v-if="augment" class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
				<span v-else class="w-full h-full rounded text-secondary text-xl font-medium font-serif border border-gray-400  flex justify-center items-center">{{ Array(augmentIndex + 1).fill('I').join('') }}</span>
			</button>
		</div>
	</div>
</div>
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
</template>

<style scoped lang="postcss">
.augment-box {
	@apply w-24 h-24 m-1 rounded-lg bg-cover text-white font-bold text-center  flex justify-center items-center;
}

.sidebar-icon {
	@apply mb-1;
	width: 9vw !important;
	height: 9vw !important;
}
</style>
