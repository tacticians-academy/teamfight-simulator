<script setup lang="ts">
import SelectItems from '#/ui/components/Sidebar/SelectItems.vue'
import SelectUnits from '#/ui/components/Sidebar/SelectUnits.vue'
import SelectPlayers from '#/ui/components/Sidebar/SelectPlayers.vue'

import { ref } from 'vue'

type SectionName = 'units' | 'items' | 'players'

const showSection = ref<SectionName>('units')

function onToggle(name: SectionName) {
	showSection.value = name
}
</script>

<template>
<div>
	<div class="segmented-control">
		<button :disabled="showSection === 'units'" @click="onToggle('units')">Units</button>
		<button :disabled="showSection === 'items'" @click="onToggle('items')">Items</button>
		<button :disabled="showSection === 'players'" @click="onToggle('players')">Players</button>
	</div>
	<hr>
	<SelectUnits v-if="showSection === 'units'" />
	<SelectItems v-else-if="showSection === 'items'" />
	<SelectPlayers v-else-if="showSection === 'players'" />
</div>
</template>
