<script setup lang="ts">
import DisplayTrait from '#/components/Sidebar/DisplayTrait.vue'

import { useStore } from '#/game/store'

import { getTeamName } from '#/helpers/boardUtils'

const { getters: { synergiesByTeam } } = useStore()
</script>

<template>
<div v-for="(teamSynergies, teamIndex) in synergiesByTeam" :key="teamIndex">
	<div class="font-semibold">Team {{ getTeamName(teamIndex) }}</div>
	<div v-for="[trait, style, currentEffect, unitNames] in teamSynergies" :key="trait.name">
		<DisplayTrait v-if="style > 0" :trait="trait" :activeStyle="style" :activeEffect="currentEffect" :units="unitNames" />
	</div>
	<div class="text-gray-500 text-sm">
		<template v-for="[trait, style] in teamSynergies" :key="trait.name">
			<span v-if="style === 0">{{ trait.name }}, </span>
		</template>
	</div>
</div>
</template>
