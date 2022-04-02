<script setup lang="ts">
import { defineProps } from 'vue'

import { getCoordFrom } from '#/store/store'

import type { HexEffect } from '#/sim/effects/HexEffect'

import type { HexCoord } from '#/sim/helpers/types'

const props = defineProps<{
	effect: HexEffect
}>()

const maxOpacity = props.effect.opacity ?? 1
const hexCoords = (props.effect.hexes as unknown as HexCoord[]).map(hex => getCoordFrom(hex)) //NOTE Vue ref workaround
</script>

<template>
<div class="hex-effect" :style="{ opacity: effect.activated ? maxOpacity : maxOpacity / 3, transition: `opacity ${effect.activated ? 100 : effect.activatesAfterMS}ms` }">
	<div v-for="[col, row] in hexCoords" :key="`${row},${col}`">
		<div
			class="hex hex-overlay  absolute z-10" :class="effect.source.team === 0 ? 'team-a' : 'team-b'"
			:style="{ left: `${col * 100}%`, top: `${row * 100}%` }"
		/>
	</div>
</div>
</template>
