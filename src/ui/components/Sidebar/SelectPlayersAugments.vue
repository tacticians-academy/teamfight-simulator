<script setup lang="ts">
import { computed, ref } from 'vue'

import type { AugmentData, AugmentGroupKey } from '@tacticians-academy/academy-library'

import { useStore, setAugmentFor, setData } from '#/store/store'

import type { TeamNumber } from '#/sim/helpers/types'

import { getIconURLFor } from '#/ui/helpers/utils'

const { state } = useStore()

const selectAugment = ref<[tierIndex: number, teamNumber: TeamNumber, augmentIndex: number] | null>(null)

function onAugmentTeamIndex(teamNumber: TeamNumber, augmentIndex: number) {
	selectAugment.value = [0, teamNumber, augmentIndex]
}
function onAugment(augment: AugmentData | null) {
	if (selectAugment.value) {
		const [tier, teamIndex, augmentIndex] = selectAugment.value
		setAugmentFor(teamIndex, augmentIndex, augment)
		selectAugment.value = null
	}
}

const augmentGroups = computed(() => {
	const augmentGroups: [string, AugmentData[]][] = [['Supported', []], ['Unimplemented', []], ['Inert', []]]
	setData.activeAugments.forEach(augment => {
		if (augment.tier - 1 !== selectAugment.value?.[0]) return
		const groupID = augment.groupID as AugmentGroupKey
		const index = setData.emptyImplementationAugments.includes(groupID) || groupID.endsWith('Crest') || groupID.endsWith('Crown') ? 2 : (setData.augmentEffects[groupID] || groupID.endsWith('Heart') || groupID.endsWith('Soul') ? 0 : 1)
		augmentGroups[index][1].push(augment)
	})
	return augmentGroups.filter(group => group[1].length)
})

const maxAugmentCount = computed(() => Math.max(1, Math.min(3, state.stageNumber - 1)))
</script>

<template>
<div>
	Augments:
	<div class="flex justify-between">
		<div v-for="(augments, teamNumber) in state.augmentsByTeam" :key="teamNumber" class="w-1/2 flex flex-col items-center">
			<div class="w-full text-secondary">{{ teamNumber === 0 ? 'Blue' : 'Red' }}:</div>
			<template v-for="(augment, augmentIndex) in augments" :key="augmentIndex">
				<button
					v-if="augmentIndex < maxAugmentCount"
					class="sidebar-icon  group" :style="{ backgroundImage: augment ? `url(${getIconURLFor(state, augment)})` : undefined }"
					:disabled="state.didStart"
					@click="onAugmentTeamIndex(teamNumber as TeamNumber, augmentIndex)"
				>
					<span v-if="augment" class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
					<span v-else class="w-full h-full rounded text-secondary text-xl font-medium font-serif border border-gray-400  flex justify-center items-center">{{ Array(augmentIndex + 1).fill('I').join('') }}</span>
				</button>
			</template>
		</div>
	</div>
</div>
<div v-if="selectAugment" class=" absolute inset-0 z-50">
	<div class="overflow-y-scroll bg-gray-600/90  flex flex-col justify-center items-center">
		<div>
			<button
				v-for="(tier, tierIndex) in ['Silver', 'Gold', 'Prismatic']" :key="tierIndex"
				class="w-20 h-16 text-white"
				@click="selectAugment[0] = tierIndex"
			>
				{{ tier }}
			</button>
			<button class="w-20 h-16 text-gray-400" @click="onAugment(null)">Clear</button>
		</div>
		<div class="mb-8 space-y-4">
			<div v-for="[label, augments] in augmentGroups" :key="label">
				<div class="ml-1 text-gray-300">{{ label }}</div>
				<div class="flex flex-wrap justify-center">
					<button
						v-for="augment in augments" :key="augment.name"
						class="augment-box  group" :style="{ backgroundImage: augment ? `url(${getIconURLFor(state, augment)})` : undefined }"
						@click="onAugment(augment)"
					>
						<span class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
					</button>
				</div>
			</div>
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
