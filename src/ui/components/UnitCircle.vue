<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'

import { onDragOver, onDropOnUnit } from '#/ui/helpers/dragDrop'
import { useStore } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import type { StarLevel } from '#/sim/helpers/types'

import { getIconURLFor } from '#/ui/helpers/utils'

const { state, setStarLevel, startDragging } = useStore()

const props = defineProps<{
	unit: ChampionUnit
}>()

const showInfo = ref(false)

const currentPosition = computed(() => props.unit.coord)

function onStar(starLevel: number) {
	setStarLevel(props.unit, starLevel as StarLevel)
}

function onInfo(event: Event) {
	event.preventDefault()
	showInfo.value = !showInfo.value
	return false
}
</script>

<template>
<div
	class="hex-unit hex-overlay  group" :class="!unit.isInteractable() ? 'opacity-50' : (unit.statusEffects.stealth.active ? 'opacity-75' : null)"
	:style="{ left: `${currentPosition[0] * 100}%`, top: `${currentPosition[1] * 100}%` }"
	:draggable="!state.didStart" @dragstart="startDragging($event, 'unit', unit.data.apiName!, unit)"
	@dragover="onDragOver" @drop="onDropOnUnit($event, unit)" @contextmenu="onInfo"
>
	<div class="circle" :style="{ backgroundImage: `url(${getIconURLFor(state, props.unit.data)})` }" :class="unit.team === 0 ? 'border-team-a' : 'border-team-b'">
		<span class="group-hover-visible">{{ unit.data.name }}</span>
	</div>
	<div class="stars">
		<button v-for="starLevel in 3" :key="starLevel" :disabled="unit.isStarLocked || state.didStart" @click="onStar(starLevel)">
			{{ starLevel <= unit.starLevel ? '★' : '☆' }}
		</button>
	</div>
	<div v-if="showInfo" class="p-1 space-x-1 bg-tertiary  inline-flex">
		<div>
			<div>AD:&nbsp;{{ Math.round(unit.attackDamage()) }}</div>
			<div>AP:&nbsp;{{ Math.round(unit.abilityPower()) }}</div>
			<div>AS:&nbsp;{{ unit.attackSpeed().toFixed(2) }}</div>
			<div>Crit:&nbsp;{{ Math.round(unit.critChance() * 100) }}%</div>
			<div v-if="unit.dodgeChance() > 0">Dodge:&nbsp;{{ Math.round(unit.dodgeChance() * 100) }}%</div>
		</div>
		<div>
			<div>AR:&nbsp;{{ unit.armor() }}</div>
			<div>MR:&nbsp;{{ unit.magicResist() }}</div>
			<div>Range:&nbsp;{{ unit.range() }}</div>
			<div>(+{{ Math.round(unit.critMultiplier() * 100) }}%)</div>
		</div>
	</div>
</div>
</template>

<style scoped lang="postcss">
.hex-unit {
	@apply pointer-events-auto;
}

.stars {
	@apply absolute w-full bottom-0 text-center text-yellow-500;
	font-size: 1.7vw;
}

.circle {
	@apply w-full h-full bg-cover rounded-full text-white font-medium  text-center;
	@apply flex justify-center items-center;
	font-size: 1.5vw;
	border-width: 0.4vw;
	background-position-x: 75%;
}
</style>
