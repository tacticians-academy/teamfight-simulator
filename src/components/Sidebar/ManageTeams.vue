<script setup lang="ts">
import SelectItems from '#/components/Sidebar/SelectItems.vue'
import SelectUnits from '#/components/Sidebar/SelectUnits.vue'
import Synergies from '#/components/Sidebar/Synergies.vue'

import { ref } from 'vue'

type SectionName = 'units' | 'items' | 'traits'

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
		<button @click="onToggle('traits')">Traits</button>
	</div>
	<SelectUnits v-if="showSection === 'units'" />
	<SelectItems v-else-if="showSection === 'items'" />
	<Synergies v-else />
</div>
</template>
