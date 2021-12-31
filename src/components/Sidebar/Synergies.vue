<script setup lang="ts">
import DisplayTrait from '#/components/Sidebar/DisplayTrait.vue'

import { traits } from '#/data/set6/traits'

import { useStore } from '#/game/board'
import { getTeamName } from '#/game/boardUtils'
import type { TraitData, TraitEffectata } from '#/game/types'

import { computed } from 'vue'

const { state } = useStore()

type SynergyCount = Record<string, Set<string>>

const synergiesByTeam = computed(() => {
	const teamSynergies: [SynergyCount, SynergyCount] = [{}, {}]
	state.units.forEach(unit => {
		const team = teamSynergies[unit.team]
		for (const trait of unit.data.traits) {
			if (team[trait] == null) {
				team[trait] = new Set()
			}
			team[trait].add(unit.name)
		}
	})
	return teamSynergies
		.map(team => Object.entries(team))
		.map(teamCountSynergies => {
			return teamCountSynergies
				.map((countSynergy): [number, TraitData, TraitEffectata | undefined, string[]] => {
					const uniqueUnitCount = countSynergy[1].size
					const traitName = countSynergy[0] as string
					const trait = traits.find(trait => trait.name === traitName)!
					const currentEffect = trait.effects.find(effect => uniqueUnitCount >= effect.minUnits && uniqueUnitCount <= effect.maxUnits)
					console.log(currentEffect?.style ?? 0, trait, currentEffect, Array.from(countSynergy[1]))
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
