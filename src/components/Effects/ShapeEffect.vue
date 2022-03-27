<script setup lang="ts">
import { defineProps } from 'vue'

import type { ShapeEffect } from '#/game/effects/ShapeEffect'

const props = defineProps<{
	effect: ShapeEffect
}>()

const maxOpacity = props.effect.opacity ?? 1
</script>

<template>
<div
	class="shape-effect  absolute z-10" :class="effect.source.team === 0 ? 'text-team-a' : 'text-team-b'"
	:style="Object.assign(effect.shape.styles(), { opacity: effect.activated ? maxOpacity : maxOpacity / 3, transition: `opacity ${effect.activated ? 100 : effect.activatesAfterMS}ms` })"
/>
</template>
