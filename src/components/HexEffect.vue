<script setup lang="ts">
import { defineProps } from 'vue'

import type { HexEffect } from '#/game/HexEffect'
import { coordinatePosition } from '#/game/store'

const props = defineProps<{
	hexEffect: HexEffect,
}>()

const hexPositions = props.hexEffect.hexes.map(coordinatePosition)
</script>

<template>
<div :key="hexEffect.instanceID" :style="{ opacity: hexEffect.activated ? 1 : 1/3, transition: `opacity ${hexEffect.activated ? 100 : hexEffect.activatesAfterMS}ms` }">
	<div v-for="[col, row] in hexPositions" :key="`${row},${col}`">
		<div
			class="hex" :class="hexEffect.source.team === 0 ? 'team-a' : 'team-b'"
			:style="{ left: `${col * 100}%`, top: `${row * 100}%` }"
		/>
	</div>
</div>
</template>

<style scoped lang="postcss">
.hex {
	@apply absolute z-10;
	transform: translate(-50%, -50%);
}
</style>
