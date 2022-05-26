<script setup lang="ts">
import { defineProps } from 'vue'

import { setData, state, useStore } from '#/store/store'

import type { CustomComp } from '#/sim/data/types'
import { getIconURLFor } from '#/ui/helpers/utils'

const props = defineProps<{
	name: string
	comp: CustomComp
}>()

const { startDragging } = useStore()

function onDrag(event: DragEvent) {
	startDragging(event, 'comp', JSON.stringify(props.comp), null)
}
</script>

<template>
<div class="p-1 bg-tertiary rounded-md  space-y-0.5" :draggable="!state.didStart" @dragstart="onDrag">
	<div class="flex justify-between">
		<div class="title  mr-1">{{ name }}</div>
		<div
			v-for="augmentName in comp.augments.filter(a => a)" :key="augmentName!"
			class="sidebar-icon  -mr-1 last:mr-0 max-w-[16.7%]" :style="{ backgroundImage: `url(${getIconURLFor(state, setData.activeAugments.find(a => a.name === augmentName)!)})` }"
		/>
	</div>
	<div class="flex">
		<div
			v-for="unit in comp.units" :key="unit.name"
			class="sidebar-icon  -mr-1 last:mr-0" :style="{ backgroundImage: `url(${getIconURLFor(state, setData.champions.find(c => c.name === unit.name)!)})` }"
		/>
	</div>
</div>
</template>

<style scoped lang="postcss">
.title {
	font-size: 1.7vw;
}
.sidebar-icon {
	margin-bottom: 0;
}
</style>
