<script setup lang="ts">
import { defineProps } from 'vue'

import type { Projectile } from '#/game/Projectile'

const props = defineProps<{
	projectile: Projectile
}>()

const size = props.projectile.missile.width ?? 20
const sizeUnits = `${size / 20}vw`
</script>

<template>
<div
	class="projectile hex-overlay" :class="projectile.source.team === 0 ? 'bg-violet-700' : 'bg-rose-700'"
	:style="{ left: `${projectile.position[0] * 100}%`, top: `${projectile.position[1] * 100}%`, width: sizeUnits, height: sizeUnits }"
/>
</template>

<style scoped lang="postcss">
.projectile {
	@apply absolute z-40 rounded-full;
}
</style>
