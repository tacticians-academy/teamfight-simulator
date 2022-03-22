<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { HexEffect } from '#/game/HexEffect'
import { getCoordFrom } from '#/game/store'

const props = defineProps<{
	hexEffect: HexEffect
}>()

const hexPositions = computed(() => props.hexEffect.hexes.value?.map(getCoordFrom) ?? [])

const maxOpacity = 1 + (props.hexEffect.damageMultiplier ?? 0)
</script>

<template>
<div :style="{ opacity: hexEffect.activated ? maxOpacity : maxOpacity / 3, transition: `opacity ${hexEffect.activated ? 100 : hexEffect.activatesAfterMS}ms` }">
	<div v-for="[col, row] in hexPositions" :key="`${row},${col}`">
		<div
			class="hex hex-overlay  absolute z-10" :class="hexEffect.source.team === 0 ? 'team-a' : 'team-b'"
			:style="{ left: `${col * 100}%`, top: `${row * 100}%` }"
		/>
	</div>
</div>
</template>
