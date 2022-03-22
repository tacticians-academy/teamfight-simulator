<script setup lang="ts">
import SelectItems from '#/components/Sidebar/SelectItems.vue'
import SelectUnits from '#/components/Sidebar/SelectUnits.vue'
import SelectPlayers from '#/components/Sidebar/SelectPlayers.vue'

import { ref } from 'vue'

type SectionName = 'units' | 'items' | 'players'

const showSection = ref<SectionName>('units')

function onToggle(name: SectionName) {
	showSection.value = name
}
</script>

<template>
<div>
	<div class="flex justify-around">
		<button :class="{ 'bg-quaternary': showSection === 'units' }" @click="onToggle('units')">
			Units
		</button>
		<button :class="{ 'bg-quaternary': showSection === 'items' }" @click="onToggle('items')">
			Items
		</button>
		<button :class="{ 'bg-quaternary': showSection === 'players' }" @click="onToggle('players')">
			Players
		</button>
	</div>
	<hr>
	<SelectUnits v-if="showSection === 'units'" />
	<SelectItems v-else-if="showSection === 'items'" />
	<SelectPlayers v-else-if="showSection === 'players'" />
</div>
</template>

<style scoped lang="postcss">
button {
	@apply my-0.5 mx-px flex-grow text-sm rounded-full;
}
</style>
