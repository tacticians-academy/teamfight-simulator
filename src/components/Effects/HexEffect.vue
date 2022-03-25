<script setup lang="ts">
import { computed, defineProps } from 'vue'

import type { HexEffect } from '#/game/effects/HexEffect'
import { getCoordFrom } from '#/game/store'

import type { HexCoord } from '#/helpers/types'

const props = defineProps<{
	hexEffect: HexEffect
}>()

const maxOpacity = Math.max(0, Math.min(1, 1 + (props.hexEffect.damageMultiplier ?? 0)))
const hexCoords = (props.hexEffect.hexes as unknown as HexCoord[]).map(hex => getCoordFrom(hex)) //NOTE Vue ref workaround
</script>

<template>
<div :style="{ opacity: hexEffect.activated ? maxOpacity : maxOpacity / 3, transition: `opacity ${hexEffect.activated ? 100 : hexEffect.activatesAfterMS}ms` }">
	<div v-for="[col, row] in hexCoords" :key="`${row},${col}`">
		<div
			class="hex hex-overlay  absolute z-10" :class="hexEffect.source.team === 0 ? 'team-a' : 'team-b'"
			:style="{ left: `${col * 100}%`, top: `${row * 100}%` }"
		/>
	</div>
</div>
</template>
