<script setup lang="ts">
import type { ItemData } from '@tacticians-academy/academy-library'

import { computed, reactive, ref } from 'vue'

import { setData, state, useStore } from '#/store/store'

import { getIconURLFor } from '#/ui/helpers/utils'

const { startDragging } = useStore()

const itemGroups = computed(() => {
	const itemGroups: [string, ItemData[]][] = [
		['Combined', setData.completedItems],
		[state.setNumber > 1 ? 'Emblems' : 'Spatula', setData.emblemItems.filter(item => (state.setNumber < 5 ? item.name !== 'Force of Nature' : item.apiName !== 'TFT_Item_ForceOfNature'))],
		['Components', setData.componentItems],
	]
	if (state.setNumber === 4.5 || (setData.ornnItems.length && state.setNumber >= 6)) {
		itemGroups.splice(2, 0, [state.setNumber >= 9.5 ? 'Artifacts' : 'Ornn', setData.ornnItems])
	}
	if (state.setNumber === 5) {
		itemGroups.splice(1, 0, ['Shadow', setData.shadowItems])
	} else if (setData.radiantItems.length && state.setNumber >= 5.5) {
		itemGroups.splice(1, 0, ['Radiant', setData.radiantItems])
	}
	if (setData.shimmerscaleItems.length && state.setNumber >= 7 && state.setNumber < 9.5) {
		itemGroups.splice(2, 0, ['Shimmerscale', setData.shimmerscaleItems])
	}
	if (setData.supportItems.length && state.setNumber >= 9.5) {
		itemGroups.splice(2, 0, ['Support', setData.supportItems])
	}
	itemGroups.forEach(group => group[1].sort((a, b) => a.name.localeCompare(b.name)))
	return itemGroups
})

const collapsed = reactive<Record<string, boolean>>({
	'Artifacts': true,
	'Ornn': true,
	'Radiant': true,
	'Shadow': true,
	'Shimmerscale': true,
	'Support': true,
})

function onToggle(title: string) {
	collapsed[title] = !collapsed[title]
}

function onDrag(event: DragEvent, name: string) {
	startDragging(event, 'item', name, null)
}

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

const searchText = ref('')
const searchItems = computed(() => {
	const searched = searchText.value.trim().toLowerCase().replaceAll(/\s+/g, ' ')
	if (searched.length <= 0) {
		return undefined
	}
	const searchWords = searched.split(' ')
	if (searchWords.length > 1) {
		searchWords.push(searchWords.join(''))
	}
	const itemScores = setData.currentItems
		.map(item => {
			let score = getSearchScore(searched, searchWords, item.name)
			if (score === 0) {
				score = getSearchScore(searched, searchWords, item.desc ?? '') / 2
			}
			return score > 0 ? [score, item] : null
		})
		.filter((e): e is [number, ItemData] => !!e)
		.sort((a, b) => {
			const scoreDiff = b[0] - a[0]
			return scoreDiff !== 0 ? scoreDiff : (a[1].name.localeCompare(b[1].name))
		})
	if (!itemScores.length) {
		return undefined
	}
	return itemScores.map(itemScore => itemScore[1])
})
</script>

<template>
<input v-model="searchText"	v-focus type="search" placeholder="Search for an item..." class="w-full border-secondary bg-primary mb-1 text-center">
<div v-if="searchItems" class="sidebar-icons-group">
	<div class="sidebar-icons-container">
		<div
			v-for="item in searchItems" :key="item.name"
			class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURLFor(state, item)})` }"
			:draggable="state.simMode === 'teamfight' && !state.didStart" @dragstart="onDrag($event, item.name)"
		>
			<div class="icon-name  group-hover-visible">{{ item.name }}</div>
		</div>
	</div>
</div>
<template v-else>
	<div
		v-for="[title, group] in itemGroups" :key="title"
		:draggable="state.simMode === 'teamfight' && !state.didStart"
		class="sidebar-icons-group"
	>
		<button class="w-full font-semibold  flex justify-between" @click="onToggle(title)">
			<div>{{ title }}</div>
			<div class="text-tertiary" :class="collapsed[title] ? '-rotate-90' : null">▼</div>
		</button>
		<div v-if="!collapsed[title]" class="sidebar-icons-container">
			<div
				v-for="item in group" :key="item.name"
				class="sidebar-icon  group" :style="{ backgroundImage: `url(${getIconURLFor(state, item)})` }"
				:draggable="state.simMode === 'teamfight' && !state.didStart" @dragstart="onDrag($event, item.name)"
			>
				<div class="icon-name  group-hover-visible">{{ item.name }}</div>
			</div>
		</div>
	</div>
</template>
</template>
