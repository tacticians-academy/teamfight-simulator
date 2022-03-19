<script setup lang="ts">
import { defineProps } from 'vue'

import type { ShapeEffect } from '#/game/ShapeEffect'

const props = defineProps<{
	shapeEffect: ShapeEffect
}>()

const maxOpacity = props.shapeEffect.damageMultiplier ?? 1
</script>

<template>
<div
	class="absolute z-10" :class="shapeEffect.source.team === 0 ? 'text-team-a' : 'text-team-b'"
	:style="Object.assign(shapeEffect.shape.styles(), { opacity: shapeEffect.activated ? maxOpacity : maxOpacity / 3, transition: `opacity ${shapeEffect.activated ? 100 : shapeEffect.activatesAfterMS}ms` })"
/>
</template>
