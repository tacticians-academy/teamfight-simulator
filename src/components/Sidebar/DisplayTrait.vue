<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { TraitData, TraitEffectData } from '#/helpers/types'
import { ASSET_PREFIX, getIconURL } from '#/helpers/utils'

const props = defineProps<{
	trait: TraitData
	activeStyle: number
	activeEffect: TraitEffectData | undefined
	units: string[]
}>()

const traitTexture = `url(${ASSET_PREFIX}/assets/ux/tft/tft_traits_texture_atlas.png)`

const iconURL = getIconURL(props.trait)
const styleOffsetX = computed(() => `-${2 + Math.min(3, props.activeStyle) * 2 * 49}px`)
const styleOffsetY = computed(() => `-${2 + (props.activeStyle >= 4 ? 58 : 0)}px`)

function substitute(text: string, effect: TraitEffectData) {
	return text
		.replaceAll('@MinUnits@', effect.minUnits.toString())
		.replaceAll('@MaxUnits@', effect.maxUnits.toString())
		.replace(/(@[\w*]+?@)/g, (placeholder) => {
			placeholder = placeholder.slice(1, -1)
			const [multiplierPlaceholder, multiplier] = placeholder.split('*')
			if (multiplier) {
				placeholder = multiplierPlaceholder
			}
			let substitution = effect.variables[placeholder]
			if (substitution == null) {
				return placeholder
			}
			if (multiplier) {
				substitution = Math.round(substitution * parseInt(multiplier, 10))
			}
			return substitution.toString()
		})
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
			:src="iconURL" :alt="trait.name"
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
