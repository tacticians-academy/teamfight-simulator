<script setup lang="ts">
import { computed, defineProps } from 'vue'

import { BonusKey } from '@tacticians-academy/academy-library'

import { useStore } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { StatusEffectType } from '#/sim/helpers/types'

import { onDragOver, onDropOnUnit } from '#/ui/helpers/dragDrop'
import { getIconURLFor } from '#/ui/helpers/utils'

const { state, startDragging } = useStore()

const props = defineProps<{
	unit: ChampionUnit
}>()

const currentPosition = computed(() => props.unit.coord)

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

</script>

<template>
<div
	class="hex-unit hex-overlay  group" :class="!unit.isInteractable() ? 'opacity-50' : null"
	:style="{ left: `${currentPosition[0] * 100}%`, top: `${currentPosition[1] * 100}%` }"
	@dragover="onDragOver" @drop="onDropOnUnit($event, unit)"
>
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
	<div class="pointer-events-auto  flex">
		<div
			v-for="item in unit.items" :key="item.name"
			class="w-1/3" :class="state.didStart ? 'pointer-events-none' : null"
			:draggable="!state.didStart" @dragstart="startDragging($event, 'item', item.name, unit)"
		>
			<img :src="getIconURLFor(state, item)" :alt="item.name">
		</div>
	</div>
	<div class="pointer-events-auto  flex items-center">
		<template v-for="(stack, key) in unit.stacks" :key="key">
			<div v-if="stack" class="w-9 h-5 z-10  flex items-center">
				<button v-if="stack.isBoolean" :class="stack.amount ? undefined : 'opacity-50'" @click="stack.onUpdate">
					{{ stack.icon }}
				</button>
				<span v-else>{{ stack.icon }}</span>
				<input
					v-if="!stack.isBoolean"
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
</template>

<style scoped lang="postcss">
.hex-overlay {
	margin-top: -0.5vw;
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

.status-effect {
	text-shadow: 0 1px 1px white;
}
</style>
