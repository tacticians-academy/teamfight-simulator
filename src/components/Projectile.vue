<script setup lang="ts">
import { defineProps } from 'vue'

import type { Projectile } from '#/game/Projectile'

import { PROJECTILE_UNITS } from '#/helpers/constants'

const props = defineProps<{
	projectile: Projectile,
}>()
</script>

<template>
<div
	class="projectile" :class="projectile.source.team === 0 ? 'bg-violet-700' : 'bg-rose-700'"
	:style="{ left: `${projectile.position[0] * 100}%`, top: `${projectile.position[1] * 100}%` }"
/>
</template>

<style scoped lang="postcss">
.projectile {
	@apply absolute z-40 rounded-full;
	width: v-bind(PROJECTILE_UNITS);
	height: v-bind(PROJECTILE_UNITS);
	transform: translate(-50%, -50%);
}
</style>
