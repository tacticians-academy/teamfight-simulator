<script setup lang="ts">
import DisplayTrait from '#/components/Sidebar/DisplayTrait.vue'

import { computed } from 'vue'

import { useStore } from '#/game/board'
import { getTeamName } from '#/game/boardUtils'
import type { TraitData, TraitEffectata } from '#/game/types'

const { state } = useStore()

type SynergyCount = Map<TraitData, string[]>

const synergiesByTeam = computed(() => {
	const teamSynergies: [SynergyCount, SynergyCount] = [new Map(), new Map()]
	state.units.forEach(unit => {
		const team = teamSynergies[unit.team]
		for (const trait of unit.traits) {
			if (!team.has(trait)) {
				team.set(trait, [unit.name])
			} else if (!team.get(trait)!.includes(unit.name)) {
				team.get(trait)?.push(unit.name)
			}
		}
	})
	return teamSynergies
		.map(team => team.entries())
		.map(teamCountSynergies => {
			return Array.from(teamCountSynergies)
				.map((countSynergy): [number, TraitData, TraitEffectata | undefined, string[]] => {
					const uniqueUnitCount = countSynergy[1].length
					const trait = countSynergy[0]
					const currentEffect = trait.effects.find(effect => uniqueUnitCount >= effect.minUnits && uniqueUnitCount <= effect.maxUnits)
					return [currentEffect?.style ?? 0, trait, currentEffect, Array.from(countSynergy[1])]
				})
				.sort((a, b) => {
					const styleDiff = b[0] - a[0]
					if (styleDiff !== 0) {
						return styleDiff
					}
					return a[3].length - b[3].length
				})
		})
})
</script>

<template>
<div v-for="(teamSynergies, teamIndex) in synergiesByTeam" :key="teamIndex">
	<div class="font-semibold">Team {{ getTeamName(teamIndex) }}</div>
	<div v-for="[style, trait, currentEffect, unitNames] in teamSynergies" :key="trait.name">
		<DisplayTrait v-if="style > 0" :trait="trait" :activeStyle="style" :activeEffect="currentEffect" :units="unitNames" />
	</div>
	<div class="text-gray-500 text-sm">
		<template v-for="[style, trait] in teamSynergies" :key="trait.name">
			<span v-if="style === 0">{{ trait.name }}, </span>
		</template>
	</div>
</div>
</template>
