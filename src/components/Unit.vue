<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'

import { getIconURL } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { getDragName, getDragType, onDragOver } from '#/game/dragDrop'
import type { DraggableType } from '#/game/dragDrop'
import { useStore } from '#/game/store'

import { HEX_PROPORTION, UNIT_SIZE_HEX_PROPORTION } from '#/helpers/constants'
import type { StarLevel } from '#/helpers/types'

const { state, setStarLevel, startDragging, copyItem, moveItem, dropUnit } = useStore()

const props = defineProps<{
	unit: ChampionUnit
}>()

const showInfo = ref(false)

const currentPosition = computed(() => props.unit.coordinatePosition())

const unitSize = `${100 * HEX_PROPORTION * UNIT_SIZE_HEX_PROPORTION}%`

function onDragStart(event: DragEvent, type: DraggableType, name: string) {
	startDragging(event, type, name, props.unit)
}

function onStar(starLevel: number) {
	setStarLevel(props.unit, starLevel as StarLevel)
}

const iconURL = `url(${getIconURL(props.unit.data)})`

function onDrop(event: DragEvent) {
	const type = getDragType(event)
	const name = getDragName(event)
	if (type == null || name == null) {
		return
	}
	event.preventDefault()
	if (type === 'item') {
		if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
			copyItem(name, props.unit)
		} else {
			moveItem(name, props.unit, state.dragUnit)
		}
	} else {
		dropUnit(event, name, props.unit.startPosition)
	}
}

function onInfo(event: Event) {
	event.preventDefault()
	showInfo.value = !showInfo.value
	return false
}
</script>

<template>
<div
	class="unit  group" :class="!unit.interacts ? 'opacity-50' : (unit.ghosting ? 'opacity-75' : null)"
	:style="{ left: `${currentPosition[0] * 100}%`, top: `${currentPosition[1] * 100}%` }"
	:draggable="!state.isRunning" @dragstart="onDragStart($event, 'unit', unit.name)"
	@dragover="onDragOver" @drop="onDrop" @contextmenu="onInfo"
>
	<div class="overlay bars">
		<div class="bar  bg-red-500">
			<div class="h-full bg-green-500" :style="{ width: `${100 * unit.health / unit.healthMax}%` }" />
			<div class="bar-container bar-health">
				<div class="bar-container  flex justify-end">
					<template v-for="(shield, index) in unit.shields" :key="index">
						<div
							v-if="shield.activated !== false"
							:style="{ width: shield.isSpellShield ? '7%' : `${100 * shield.amount / unit.healthMax}%` }"
							:class="shield.isSpellShield ? 'bg-purple-600' : 'bg-gray-300'"
						/>
					</template>
				</div>
				<span class="ml-px relative z-50">{{ Math.ceil(unit.health) }}</span>
			</div>
		</div>
		<div v-if="unit.data.stats.mana > 0" class="bar bar-small  bg-white">
			<div class="h-full bg-blue-500" :style="{ width: `${100 * unit.mana / unit.manaMax()}%` }" />
		</div>
		<div class="flex">
			<div
				v-for="item in unit.items" :key="item.name"
				class="w-1/3"
				:draggable="!state.isRunning" @dragstart="onDragStart($event, 'item', item.name)"
			>
				<img :src="getIconURL(item)" :alt="item.name">
			</div>
		</div>
	</div>
	<!-- <div class="circle" :class="unit.team === 0 ? 'bg-violet-500' : 'bg-rose-500'"> -->
	<div class="circle" :style="{ backgroundImage: iconURL }" :class="unit.team === 0 ? 'border-violet-500' : 'border-rose-500'">
		<span class="group-hover-visible">{{ unit.name }}</span>
	</div>
	<div class="overlay stars">
		<button v-for="starLevel in 3" :key="starLevel" :disabled="unit.isStarLocked || state.isRunning" @click="onStar(starLevel)">
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
.unit {
	@apply absolute pointer-events-auto;
	width: v-bind(unitSize);
	height: v-bind(unitSize);
	transform: translate(-50%, -50%);
}
.overlay {
	@apply absolute w-full;
}
.bars {
	top: -1vw;
}

.bar {
	@apply relative w-full border border-gray-800;
	margin-bottom: -1px;
	height: 0.9vw;
}
.bar-container {
	@apply absolute inset-0;
}
.bar-health {
	@apply text-black;
	font-size: 0.7vw;
	line-height: 0.7vw;
}
.bar-small {
	height: 0.7vw;
}
.stars {
	@apply bottom-0 text-center text-yellow-500;
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
