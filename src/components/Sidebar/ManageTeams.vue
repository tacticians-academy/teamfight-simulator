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
	<div class="flex justify-around flex-grow">
		<button @click="onToggle('units')">Units</button>
		<button @click="onToggle('items')">Items</button>
		<button @click="onToggle('players')">Players</button>
	</div>
	<SelectUnits v-if="showSection === 'units'" />
	<SelectItems v-else-if="showSection === 'items'" />
	<SelectPlayers v-else-if="showSection === 'players'" />
</div>
</template>
