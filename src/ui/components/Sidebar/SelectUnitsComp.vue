<script setup lang="ts">
import { setData, setDataReactive, state, useStore } from '#/store/store'
import { saveComps } from '#/store/storage'

import type { CustomComp } from '#/sim/data/types'
import { getIconURLFor } from '#/ui/helpers/utils'

const props = defineProps<{
	name: string
	comp: CustomComp
	canDelete: boolean
}>()

const { startDragging } = useStore()

function onDrag(event: DragEvent) {
	startDragging(event, 'comp', JSON.stringify(props.comp), null)
}

function onDelete() {
	delete setDataReactive.compsUser[props.name]
	saveComps(state.setNumber)
}
</script>

<template>
<div class="p-1 bg-tertiary rounded-md group  space-y-0.5" :draggable="!state.didStart" @dragstart="onDrag">
	<div class="flex justify-between">
		<div class="title  mr-1  flex justify-between">
			<div>{{ name }}</div>
			<button v-if="canDelete" class="hidden group-hover:block" @click="onDelete">❌</button>
		</div>
		<div
			v-for="augmentName in comp.augments.filter(a => a)" :key="augmentName!"
			class="sidebar-icon unit  -mr-1 last:mr-0 max-w-[16.7%]" :style="{ backgroundImage: `url(${getIconURLFor(state, setData.activeAugments.find(a => a.name === augmentName)!)})` }"
		/>
	</div>
	<div class="flex">
		<div
			v-for="unit in comp.units" :key="unit.id"
			class="sidebar-icon unit  -mr-1 last:mr-0" :style="{ backgroundImage: `url(${getIconURLFor(state, setData.champions.find(c => c.apiName === unit.id)!)})` }"
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
