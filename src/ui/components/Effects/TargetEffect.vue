<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { TargetEffect } from '#/sim/effects/TargetEffect'
import type { ChampionUnit } from '#/sim/ChampionUnit'

const props = defineProps<{
	effect: TargetEffect
	sourceTarget: [ChampionUnit, ChampionUnit] | any //NOTE vue-ts error
}>()

const [source, target] = props.sourceTarget as [ChampionUnit, ChampionUnit]

const data = computed(() => {
	const [x1, y1] = source.coord
	const [x2, y2] = target.coord
	const distanceX = x2 - x1
	const distanceY = y2 - y1
	const length = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
	const angle = Math.atan2(distanceY, distanceX)
	return [x1, y1, length, angle]
})

const maxOpacity = (props.effect.opacity ?? 1) * 0.75
</script>

<template>
<div
	class="target-effect" :class="effect.source.team === 0 ? 'bg-team-a' : 'bg-team-b'"
	:style="{ left: `${data[0] * 100}%`, top: `${data[1] * 100}%`, width: `${data[2] * 100}%`, height: '1vw', opacity: maxOpacity, transformOrigin: '0 calc(100% - 0.5vw)', transform: `translate(0, -0.5vw) rotate(${data[3]}rad)`, transitionDuration: target.dead || effect.source.dead ? '100ms' : undefined }"
/>
</template>

<style scoped lang="postcss">
.target-effect {
	@apply absolute z-40 rounded-full;
}
</style>
