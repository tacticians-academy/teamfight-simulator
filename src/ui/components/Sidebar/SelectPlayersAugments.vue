<script setup lang="ts">
import SelectPlayersAugmentsEntry from '#/ui/components/Sidebar/SelectPlayersAugmentsEntry.vue'

import { computed, ref } from 'vue'

import type { AugmentData, AugmentGroupKey } from '@tacticians-academy/academy-library'

import { useStore, setAugmentFor, setData } from '#/store/store'

import type { TeamNumber } from '#/sim/helpers/types'
import { getIconURLFor } from '#/ui/helpers/utils'

const { state } = useStore()

const selectAugment = ref<[tierIndex: number, teamNumber: TeamNumber, augmentIndex: number] | null>(null)

function onTier(tier: number) {
	if (selectAugment.value) {
		selectAugment.value[0] = tier
	}
}

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

// Search

const searchText = ref('')

function getSearchScore(searchWhole: string, searchWords: string[], testAgainst: string) {
	testAgainst = testAgainst.toLowerCase()
	const maxWordScore = searchWords.length + 1
	let score = 0
	if (testAgainst.includes(searchWhole)) {
		score = testAgainst.startsWith(searchWhole) ? maxWordScore * 2 : maxWordScore
	} else {
		searchWords.forEach(word => {
			if (testAgainst.includes(word)) {
				score += testAgainst.startsWith(word) ? 2 : 1
			}
		})
	}
	return score
}

const searchAugments = computed(() => {
	const searched = searchText.value.trim().toLowerCase().replaceAll(/\s+/g, ' ')
	if (searched.length <= 1) {
		return undefined
	}
	const searchWords = searched.split(' ')
	if (searchWords.length > 1) {
		searchWords.push(searchWords.join(''))
	}
	const augmentScores = setData.activeAugments
		.map(augment => {
			let score = getSearchScore(searched, searchWords, augment.name)
			if (score === 0) {
				score = getSearchScore(searched, searchWords, augment.desc) / 2
			}
			return score > 0 ? [score, augment] : null
		})
		.filter((e): e is [number, AugmentData] => !!e)
		.sort((a, b) => {
			const scoreDiff = b[0] - a[0]
			return scoreDiff !== 0 ? scoreDiff : (a[1].tier - b[1].tier)
		})
	return augmentScores.map(augmentScore => augmentScore[1])
})

function onSearchEnter() {
	if (searchAugments.value?.length === 1) {
		onAugment(searchAugments.value[0])
	}
}
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
<div v-if="selectAugment" class=" absolute inset-0 z-50 overflow-y-scroll">
	<div class="min-h-[100%] bg-gray-600/90   flex flex-col items-center">
		<div>
			<button
				v-for="(tier, tierIndex) in ['Silver', 'Gold', 'Prismatic']" :key="tierIndex"
				class="w-20 h-16 text-white"
				@click="onTier(tierIndex)"
			>
				{{ tier }}
			</button>
			<button class="w-20 h-16 text-gray-400" @click="onAugment(null)">Clear</button>
		</div>
		<form @submit.prevent="onSearchEnter">
			<input
				v-model="searchText" v-focus
				type="text" placeholder="Search for an augment..."
				class="bg-primary mb-1 w-64 text-center rounded"
			>
		</form>
		<div class="mb-8 space-y-4">
			<div v-if="searchAugments" class="flex flex-wrap justify-center">
				<SelectPlayersAugmentsEntry
					v-for="augment in searchAugments" :key="augment.name"
					:augment="augment"
					@click="onAugment(augment)"
				/>
			</div>
			<template v-else>
				<div v-for="[label, augments] in augmentGroups" :key="label">
					<div class="ml-1 text-gray-300">{{ label }}</div>
					<div class="flex flex-wrap justify-center">
						<SelectPlayersAugmentsEntry
							v-for="augment in augments" :key="augment.name"
							:augment="augment"
							@click="onAugment(augment)"
						/>
					</div>
				</div>
			</template>
		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.sidebar-icon {
	@apply mb-1;
	width: 9vw !important;
	height: 9vw !important;
}
</style>
