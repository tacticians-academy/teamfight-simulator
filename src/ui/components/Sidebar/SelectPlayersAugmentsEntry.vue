<script setup lang="ts">
import { defineProps, ref } from 'vue'

import type { AugmentData, AugmentGroupKey } from '@tacticians-academy/academy-library'

import { useStore, setAugmentFor, setData } from '#/store/store'

import { getIconURLFor } from '#/ui/helpers/utils'

const { state } = useStore()

const props = defineProps<{
	augment: AugmentData
}>()
</script>

<template>
<button
	class="augment-box  group" :style="{ backgroundImage: augment ? `url(${getIconURLFor(state, augment)})` : undefined }"
>
	<span class="sidebar-icon-name  group-hover-visible">{{ augment.name }}</span>
</button>
</template>

<style scoped lang="postcss">
.augment-box {
	@apply w-24 h-24 m-1 rounded-lg bg-cover text-white font-bold text-center  flex justify-center items-center;
}

.sidebar-icon {
	@apply mb-1;
	width: 9vw !important;
	height: 9vw !important;
}
</style>
