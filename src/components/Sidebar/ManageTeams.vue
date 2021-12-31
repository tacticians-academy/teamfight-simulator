<script setup lang="ts">
import SelectItems from '#/components/Sidebar/SelectItems.vue'
import SelectUnits from '#/components/Sidebar/SelectUnits.vue'

import { ref } from 'vue'

const showUnits = ref(true)

function onToggle(toUnits: boolean) {
	showUnits.value = toUnits
}
</script>

<template>
<div>
	<div class="flex justify-around flex-grow">
		<button @click="onToggle(true)">Units</button>
		<button @click="onToggle(false)">Items</button>
	</div>
	<SelectUnits v-if="showUnits" />
	<SelectItems v-else />
</div>
</template>
