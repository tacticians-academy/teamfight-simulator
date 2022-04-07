<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'

import { BonusKey } from '@tacticians-academy/academy-library'

import { getDragName, getDragType, onDragOver } from '#/ui/helpers/dragDrop'
import type { DraggableType } from '#/ui/helpers/dragDrop'
import { useStore } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { UNIT_SIZE_PROPORTION } from '#/sim/helpers/constants'
import { StatusEffectType } from '#/sim/helpers/types'
import type { StarLevel } from '#/sim/helpers/types'

import { getIconURLFor } from '#/ui/helpers/utils'

const { state, setStarLevel, startDragging, copyItem, moveItem, dropUnit } = useStore()

const props = defineProps<{
	unit: ChampionUnit
}>()

const showInfo = ref(false)

const currentPosition = computed(() => props.unit.coord)

const unitSize = `${100 * UNIT_SIZE_PROPORTION}%`

const statusEffectSymbols: Record<StatusEffectType, string> = {
	[StatusEffectType.ablaze]: '🔥',
	[StatusEffectType.aoeDamageReduction]: '💦',
	[StatusEffectType.armorReduction]: '🛡',
	[StatusEffectType.attackSpeedSlow]: '❄️',
	[StatusEffectType.banished]: '🕴',
	[StatusEffectType.ccImmune]: '🪨', // 💉 🐢
	[StatusEffectType.disarm]: '🤺',
	[StatusEffectType.empowered]: '🔋',
	[StatusEffectType.grievousWounds]: '❤️‍🔥', // 💔
	[StatusEffectType.invulnerable]: '🕊',
	[StatusEffectType.magicResistReduction]: '🧞',
	[StatusEffectType.stealth]: '👻',
	[StatusEffectType.stunned]: '🔗', // ⛓
	[StatusEffectType.unstoppable]: '🗝', // 🔓
}

function onDragStart(event: DragEvent, type: DraggableType, name: string) {
	startDragging(event, type, name, props.unit)
}

function onStar(starLevel: number) {
	setStarLevel(props.unit, starLevel as StarLevel)
}

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
		dropUnit(event, name, props.unit.startHex)
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
	class="unit hex-overlay  z-20  group" :class="!unit.isInteractable() ? 'opacity-50' : (unit.statusEffects.stealth.active ? 'opacity-75' : null)"
	:style="{ left: `${currentPosition[0] * 100}%`, top: `${currentPosition[1] * 100}%` }"
	:draggable="!state.didStart" @dragstart="onDragStart($event, 'unit', unit.name)"
	@dragover="onDragOver" @drop="onDrop" @contextmenu="onInfo"
>
	<div class="overlay bars">
		<div class="bar  bg-red-500">
			<div class="h-full bg-green-500" :style="{ width: `${100 * unit.health / unit.healthMax}%` }" />
			<div class="bar-container bar-health">
				<div class="bar-container  flex justify-end">
					<template v-for="(shield, index) in unit.shields" :key="index">
						<div
							v-if="shield.activated === true"
							:style="{ width: shield.type ? '5%' : `${100 * (shield.amount ?? 0) / unit.healthMax}%` }"
							:class="shield.type === 'spellShield' ? 'bg-purple-600' : (shield.type === 'barrier' ? 'bg-cyan-600' : 'bg-gray-300')"
						/>
					</template>
				</div>
				<span class="ml-px relative z-50">{{ Math.round(unit.health) }}</span>
			</div>
		</div>
		<div v-if="unit.data.stats.mana > 0" class="bar bar-small  bg-white">
			<div class="h-full bg-blue-500" :style="{ width: `${100 * unit.mana / unit.manaMax()}%`, opacity: unit.getBonuses(BonusKey.ManaReductionPercent) < 0 ? 0.6 : 1 }" />
		</div>
		<div class="flex">
			<div
				v-for="item in unit.items" :key="item.name"
				class="w-1/3" :class="state.didStart ? 'pointer-events-none' : null"
				:draggable="!state.didStart" @dragstart="onDragStart($event, 'item', item.name)"
			>
				<img :src="getIconURLFor(state, item)" :alt="item.name">
			</div>
		</div>
		<div class="flex items-center">
			<template v-for="(stack, key) in unit.stacks" :key="key">
				<div v-if="stack" class="w-9 h-5 z-10  flex items-center">
					{{ stack.icon }}
					<input
						:value="stack.amount" :disabled="state.didStart" type="number" :max="stack.max"
						class="status-effect  block text-sm font-medium p-0 w-9 h-full bg-transparent border-transparent"
						@input="stack.onUpdate"
					>
				</div>
			</template>
			<template v-for="(effect, effectType) in unit.statusEffects" :key="effectType">
				<div v-if="effect.active" class="status-effect">{{ statusEffectSymbols[effectType] }}</div>
			</template>
		</div>
	</div>
	<!-- <div class="circle" :class="unit.team === 0 ? 'bg-violet-500' : 'bg-rose-500'"> -->
	<div class="circle" :style="{ backgroundImage: `url(${getIconURLFor(state, props.unit.data)})` }" :class="unit.team === 0 ? 'border-violet-500' : 'border-rose-500'">
		<span class="group-hover-visible">{{ unit.name }}</span>
	</div>
	<div class="overlay stars">
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
.unit {
	@apply absolute pointer-events-auto;
	width: v-bind(unitSize);
	height: v-bind(unitSize);
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

.status-effect {
	text-shadow: 0 1px 1px white;
}
</style>
