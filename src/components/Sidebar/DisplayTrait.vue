<script setup lang="ts">
import { computed, defineProps } from 'vue'

import { substituteVariables, getAssetPrefixFor } from '@tacticians-academy/academy-library'
import type { EffectVariables, TraitData, TraitEffectData } from '@tacticians-academy/academy-library'

import { state } from '#/game/store'

import { getIconURLFor } from '#/helpers/utils'

const props = defineProps<{
	trait: TraitData
	activeStyle: number
	activeEffect: TraitEffectData | undefined
	units: string[]
}>()

const traitTexture = `url(${getAssetPrefixFor(state.setNumber)}${state.setNumber <= 1 ? 'data/menu/textures' : 'assets/ux/tft'}/tft_traits_texture_atlas.png)`

const styleOffsetX = computed(() => `-${2 + Math.min(3, props.activeStyle) * 2 * 49}px`)
const styleOffsetY = computed(() => `-${2 + (props.activeStyle >= 4 ? 58 : 0)}px`)

function substitute(text: string, effect: TraitEffectData) {
	const normalizedVariables: EffectVariables = {}
	Object.keys(effect.variables).forEach(key => normalizedVariables[key.toUpperCase()] = effect.variables[key])
	const description = text
		.replaceAll('@MinUnits@', effect.minUnits.toString())
		.replaceAll('@MaxUnits@', effect.maxUnits.toString())
	return substituteVariables(description, [normalizedVariables])
}

function formatRow(text: string, effect: TraitEffectData) {
	const result = substitute(text, effect)
	return effect.style === props.activeStyle ? `<b>${result}</b>` : result
}

const traitDescription = computed(() => {
	let desc = props.trait.desc
	if (desc.endsWith('<br>')) {
		desc = desc.slice(0, -4)
	}
	let result = desc
	if (result.includes('<expandRow>')) {
		result = result.replace(/<expandRow>(.+?)<\/expandRow>/g, (rowText) => {
			return props.trait.effects
				.map(effect => formatRow(rowText, effect))
				.join('<br>')
		})
	}
	if (result.includes('<row>')) {
		let rowIndex = 0
		result = result.replace(/(<row>.+?<\/row>)/g, (rowText) => {
			const effect = props.trait.effects[rowIndex]
			rowIndex += 1
			return formatRow(rowText, effect)
		})
	}
	return substitute(result, props.trait.effects[0])
})
</script>

<template>
<div class="relative group  flex items-center">
	<div class="trait-style  mr-1  flex items-center justify-center">
		<img
			:src="getIconURLFor(state, props.trait)" :alt="trait.name"
			class="pointer-events-none"
		>
	</div>
	{{ trait.name }}
	<div class="trait-tooltip  group-hover-visible  bg-tertiary space-y-2 pointer-events-none">
		<div v-html="traitDescription" />
		<div>{{ units.join(', ') }}</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.trait-style {
	width: 48px;
	height: 54px;
	background-image: v-bind(traitTexture);
	background-position: v-bind(styleOffsetX) v-bind(styleOffsetY);
}

.trait-tooltip {
	@apply absolute z-50 top-0 mt-9 p-1;
	font-size: 1.3vw;
}
</style>
