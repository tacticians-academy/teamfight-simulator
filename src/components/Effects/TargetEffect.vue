<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { TargetEffect } from '#/game/effects/TargetEffect'
import type { ChampionUnit } from '#/game/ChampionUnit'

const props = defineProps<{
	targetEffect: TargetEffect
	target: ChampionUnit
}>()

const data = computed(() => {
	const [x1, y1] = props.targetEffect.source.coord // eslint-disable-line vue/no-setup-props-destructure
	const [x2, y2] = props.target.coord // eslint-disable-line vue/no-setup-props-destructure
	const distanceX = x2 - x1
	const distanceY = y2 - y1
	const length = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
	const angle = Math.atan2(distanceY, distanceX)
	return [x1, y1, length, angle]
})
</script>

<template>
<div
	class="target-effect" :class="targetEffect.source.team === 0 ? 'bg-violet-700' : 'bg-rose-700'"
	:style="{ left: `${data[0] * 100}%`, top: `${data[1] * 100}%`, width: `${data[2] * 100}%`, height: '1vw', transformOrigin: '0 calc(100% - 0.5vw)', transform: `translate(0, -0.5vw) rotate(${data[3]}rad)`, transitionDuration: target.dead || targetEffect.source.dead ? '100ms' : undefined }"
/>
</template>

<style scoped lang="postcss">
.target-effect {
	@apply absolute z-40 rounded-full opacity-75;
}
</style>
