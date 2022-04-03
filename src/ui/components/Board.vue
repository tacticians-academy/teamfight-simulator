<script setup lang="ts">
import HexEffect from '#/ui/components/Effects/HexEffect.vue'
import ProjectileEffect from '#/ui/components/Effects/ProjectileEffect.vue'
import ShapeEffect from '#/ui/components/Effects/ShapeEffect.vue'
import TargetEffect from '#/ui/components/Effects/TargetEffect.vue'
import Unit from '#/ui/components/Unit.vue'

import { computed, onMounted, ref } from 'vue'

import { useStore, getCoordFrom, getSocialiteHexStrength, setSocialiteHex, loadedBoard } from '#/store/store'

import { getMirrorHex, isSameHex } from '#/sim/helpers/hexes'
import type { HexCoord } from '#/sim/helpers/types'

import { HALF_HEX_UNITS, HALF_HEX_BORDER_UNITS, HEX_BORDER_UNITS, HEX_UNITS, QUARTER_HEX_INSET_UNITS } from '#/ui/helpers/constants'
import { getDragNameOf, onDragOver } from '#/ui/helpers/dragDrop'

const hexContainer = ref<HTMLElement | null>(null)

const { getters, state, dropUnit } = useStore()

const showingSocialite = computed(() => !state.didStart && Math.floor(state.setNumber) === 6)

function onDrop(event: DragEvent, hex: HexCoord) {
	const championName = getDragNameOf('unit', event)
	if (championName == null) {
		return
	}
	event.preventDefault()
	dropUnit(event, championName, hex)
}

const hexForMenu = ref<HexCoord | null>(null)
const coordForMenu = computed(() => hexForMenu.value && getCoordFrom(hexForMenu.value))
const sourceHexForMenu = computed(() => hexForMenu.value && getMirrorHex(hexForMenu.value))

function onHexMenu(hex: HexCoord) {
	hexForMenu.value = showingSocialite.value ? hex : null
}

function setSocialite(socialiteIndex: number) {
	if (!sourceHexForMenu.value) { return }
	setSocialiteHex(socialiteIndex, isSameHex(state.socialiteHexes[socialiteIndex], sourceHexForMenu.value) ? null : sourceHexForMenu.value)
}

function onClearHexMenu(event?: Event) {
	event?.preventDefault()
	hexForMenu.value = null
}

onMounted(() => {
	// Cache hex positions
	const container = hexContainer.value!
	const containerRect = container.getBoundingClientRect()
	const containerSize = containerRect.width
	const rows = Array.from(container.children) as HTMLElement[]
	// const firstHex = rows[0].children[0]
	// state.hexProportion = 0.126 // firstHex.getBoundingClientRect().width / containerSize
	for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
		const row = rows[rowIndex]
		const cols = Array.from(row.children) as HTMLElement[]
		for (let colIndex = 0; colIndex < cols.length; colIndex += 1) {
			const col = cols[colIndex]
			const hexWidthHalf = col.offsetWidth / 2
			const x = row.offsetLeft + col.offsetLeft + hexWidthHalf
			const y = row.offsetTop + col.offsetTop + hexWidthHalf
			state.hexRowsCols[rowIndex][colIndex].coord = [x / containerSize, y / containerSize]
		}
	}

	loadedBoard()
})
</script>

<template>
<div class="board">
	<div class="relative">
		<div ref="hexContainer" class="overflow-x-hidden aspect-square">
			<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
				<div
					v-for="colRow in row" :key="colRow.hex[1]"
					class="hex" :class="rowIndex < state.rowsPerSide ? 'team-a' : 'team-b'"
					:style="{ boxShadow: showingSocialite && getters.socialitesByTeam.value[rowIndex < state.rowsPerSide ? 0 : 1] && getSocialiteHexStrength(colRow.hex) > 0 ? `inset 0 0 ${3 - getSocialiteHexStrength(colRow.hex)}vw blue` : undefined }"
					@dragover="onDragOver" @drop="onDrop($event, colRow.hex)"
					@contextmenu.prevent="onHexMenu(colRow.hex)"
				/>
			</div>
		</div>
		<div class="absolute inset-0 pointer-events-none">
			<template v-for="unit in state.units" :key="unit.instanceID">
				<Unit v-if="unit.hasCollision()" :unit="unit" />
			</template>
			<transition-group name="fade">
				<template v-for="hexEffect in state.hexEffects" :key="hexEffect.instanceID">
					<HexEffect v-if="hexEffect.started" :effect="hexEffect" />
				</template>
			</transition-group>
			<template v-for="projectileEffect in state.projectileEffects" :key="projectileEffect.instanceID">
				<ProjectileEffect v-if="projectileEffect.started" :effect="projectileEffect" />
			</template>
			<transition-group name="fade">
				<template v-for="shapeEffect in state.shapeEffects" :key="shapeEffect.instanceID">
					<ShapeEffect v-if="shapeEffect.started" :effect="shapeEffect" />
				</template>
			</transition-group>
			<transition-group name="fade">
				<template v-for="targetEffect in state.targetEffects" :key="targetEffect.instanceID">
					<template v-if="targetEffect.started">
						<TargetEffect v-for="(sourceTarget, index) in targetEffect.sourceTargets" :key="index" :effect="targetEffect" :sourceTarget="sourceTarget" />
					</template>
				</template>
			</transition-group>
			<div
				v-if="coordForMenu && showingSocialite"
				class="hex hex-overlay  pointer-events-auto absolute bg-tertiary text-primary  flex flex-col justify-center space-y-1"
				:style="{ left: `${coordForMenu[0] * 100}%`, top: `${coordForMenu[1] * 100}%` }"
				@click="onClearHexMenu" @contextmenu="onClearHexMenu"
			>
				<button class="hex-button  bg-quaternary" @click="setSocialite(0)">{{ isSameHex(state.socialiteHexes[0], sourceHexForMenu) ? '❎' : '' }} Socialite</button>
				<button class="hex-button  bg-quaternary" @click="setSocialite(1)">{{ isSameHex(state.socialiteHexes[1], sourceHexForMenu) ? '❎' : '' }} Duet</button>
			</div>
		</div>
	</div>
</div>
</template>

<style lang="postcss">
.hex {
	width: v-bind(HEX_UNITS);
	height: v-bind(HEX_UNITS);
	clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
}
.hex-overlay {
	transform: translate(-50%, -50%);
}
.hex.team-a {
	@apply bg-violet-300/90;
}
.hex.team-b {
	@apply bg-rose-300/90;
}
.text-team-a {
	@apply text-violet-300;
}
.text-team-b {
	@apply text-rose-300;
}
</style>

<style scoped lang="postcss">
.hex.team-a {
	@apply bg-violet-300/25;
}
.hex.team-b {
	@apply bg-rose-300/25;
}

.fade-leave-active {
	transition: opacity 1500ms;
}
.hex-effect.fade-leave-active, .shape-effect.fade-leave-active {
	transition: opacity 1500ms !important;
}
.fade-enter-from, .fade-leave-to {
	opacity: 0 !important;
}
</style>

<style scoped lang="postcss">
.row {
	@apply relative  flex;
	margin-bottom: v-bind(QUARTER_HEX_INSET_UNITS);
}
.row:last-child {
	margin-bottom: v-bind(HEX_BORDER_UNITS);
}
.row-alt {
	left: v-bind(HALF_HEX_UNITS);
	margin-left: v-bind(HALF_HEX_BORDER_UNITS);
}

.row > .hex {
	margin: v-bind(HEX_BORDER_UNITS) 0 0 v-bind(HEX_BORDER_UNITS);
}

.hex-button {
	@apply mx-1 rounded-full;
	font-size: 1.3vw;
}
</style>
