<script setup lang="ts">
import DisplayTrait from '#/ui/components/Sidebar/DisplayTrait.vue'

import { useStore, getValueOfTeam } from '#/store/store'

const { getters: { synergiesByTeam }, state } = useStore()
</script>

<template>
<div class="p-1">
	<div>
		<span class="">Board value: {{ getValueOfTeam(0) }}</span>
	</div>
	<div v-for="{ key, trait, activeStyle, activeEffect, uniqueUnitNames } in synergiesByTeam[0]" :key="key">
		<DisplayTrait v-if="activeStyle > 0" :trait="trait" :activeStyle="activeStyle" :activeEffect="activeEffect" :units="uniqueUnitNames" />
	</div>
	<div class="text-secondary text-sm">
		<template v-for="{ key, trait, activeStyle } in synergiesByTeam[0]" :key="key">
			<span v-if="activeStyle === 0">{{ trait.name }}, </span>
		</template>
	</div>
</div>
</template>
