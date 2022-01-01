<script setup lang="ts">
import { defineProps } from 'vue'

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
</script>

<template>
<div class="flex items-center" :title="units.join(', ')">
	<div class="trait-style  mr-1  flex items-center justify-center">
		<img
			:src="iconURL" :alt="trait.name"
			class="pointer-events-none"
		>
	</div>
	{{ trait.name }}
</div>
</template>

<style scoped lang="postcss">
.trait-style {
	width: 48px;
	height: 54px;
	background-image: url('https://raw.communitydragon.org/latest/game/assets/ux/tft/tft_traits_texture_atlas.png');
	background-position: v-bind(styleOffsetX) v-bind(styleOffsetY);
}
</style>
