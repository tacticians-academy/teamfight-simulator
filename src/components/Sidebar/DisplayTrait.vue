<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { TraitData, TraitEffectata } from '#/helpers/types'
import { getIconURL } from '#/helpers/utils'

const props = defineProps<{
	trait: TraitData
	activeStyle: number
	activeEffect: TraitEffectata | undefined
	units: string[]
}>()

const iconURL = getIconURL(props.trait.icon)
const styleOffsetX = `-${2 + Math.min(3, props.activeStyle) * 2 * 49}px`
const styleOffsetY = `-${2 + (props.activeStyle >= 4 ? 58 : 0)}px`
function substitute(text: string, effect: TraitEffectata) {
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

function formatRow(text: string, effect: TraitEffectata) {
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
	<div class="trait-tooltip  group-hover-visible space-y-2">
		<div v-html="traitDescription" />
		<div>{{ units.join(', ') }}</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.trait-style {
	width: 48px;
	height: 54px;
	background-image: url('https://raw.communitydragon.org/latest/game/assets/ux/tft/tft_traits_texture_atlas.png');
	background-position: v-bind(styleOffsetX) v-bind(styleOffsetY);
}

.trait-tooltip {
	@apply absolute z-10 top-0 mt-9 ml-6 bg-gray-300 p-1;
	font-size: 1.3vw;
}
</style>
