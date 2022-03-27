<script setup lang="ts">
import { defineProps } from 'vue'

import type { ProjectileEffect } from '#/game/effects/ProjectileEffect'

const props = defineProps<{
	effect: ProjectileEffect
}>()

const sizeUnits = `${props.effect.width * 100}%`

const coord = props.effect.coord // eslint-disable-line vue/no-setup-props-destructure
</script>

<template>
<div
	class="projectile hex-overlay" :class="effect.source.team === 0 ? 'bg-violet-700' : 'bg-rose-700'"
	:style="{ left: `${coord[0] * 100}%`, top: `${coord[1] * 100}%`, width: sizeUnits, height: sizeUnits }"
/>
</template>

<style scoped lang="postcss">
.projectile {
	@apply absolute z-40 rounded-full;
}
</style>
