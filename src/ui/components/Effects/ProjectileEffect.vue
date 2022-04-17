<script setup lang="ts">
import { defineProps } from 'vue'

import type { ProjectileEffect } from '#/sim/effects/ProjectileEffect'

const props = defineProps<{
	effect: ProjectileEffect
}>()
</script>

<template>
<div
	class="projectile hex-overlay" :class="effect.source.team === 0 ? 'bg-team-a' : 'bg-team-b'"
	:style="{ left: `${effect.coord[0] * 100}%`, top: `${effect.coord[1] * 100}%`, width: `${effect.width * 100}%`, height: `${effect.width * 100}%`, opacity: effect.opacity ?? 1 }"
/>
</template>

<style scoped lang="postcss">
.projectile {
	@apply absolute z-40 rounded-full;
}
</style>
