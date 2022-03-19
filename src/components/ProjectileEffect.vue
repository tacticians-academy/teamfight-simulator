<script setup lang="ts">
import { defineProps } from 'vue'

import type { ProjectileEffect } from '#/game/ProjectileEffect'

const props = defineProps<{
	projectile: ProjectileEffect
}>()

const size = props.projectile.missile.width ?? 20
const sizeUnits = `${size / 20}vw`
</script>

<template>
<div
	class="projectile hex-overlay" :class="projectile.source.team === 0 ? 'bg-violet-700' : 'bg-rose-700'"
	:style="{ left: `${projectile.position.value[0] * 100}%`, top: `${projectile.position.value[1] * 100}%`, width: sizeUnits, height: sizeUnits }"
/>
</template>

<style scoped lang="postcss">
.projectile {
	@apply absolute z-40 rounded-full;
}
</style>
