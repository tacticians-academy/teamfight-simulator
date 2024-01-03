<script setup lang="ts">
import HexEffectVue from '#/ui/components/Effects/HexEffect.vue'
import ProjectileEffectVue from '#/ui/components/Effects/ProjectileEffect.vue'
import ShapeEffectVue from '#/ui/components/Effects/ShapeEffect.vue'
import TargetEffectVue from '#/ui/components/Effects/TargetEffect.vue'
import UnitCircle from '#/ui/components/UnitCircle.vue'
import UnitOverlay from '#/ui/components/UnitOverlay.vue'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useStore, setData, getSocialiteHexStrength, setSocialiteHex, setDataReactive, moveUnit } from '#/store/store'
import { saveComps, toStorage } from '#/store/storage'

import { boardRowsCols, calculateCoordForHex, getClosestHexAvailableTo, getCoordFrom, getDefaultHexFor } from '#/sim/helpers/board'
import { getMirrorHex, getTeamForRow, isSameHex } from '#/sim/helpers/hexes'
import type { HexCoord } from '#/sim/helpers/types'
import { BOARD_COL_COUNT, UNIT_SIZE_PROPORTION } from '#/sim/helpers/constants'
import { getUnitsOfTeam } from '#/sim/helpers/effectUtils'
import type { HexEffect } from '#/sim/effects/HexEffect'
import type { ProjectileEffect } from '#/sim/effects/ProjectileEffect'
import type { ShapeEffect } from '#/sim/effects/ShapeEffect'
import type { TargetEffect } from '#/sim/effects/TargetEffect'

import { BOARD_UNITS_RAW, HEX_SIZE_UNITS } from '#/ui/helpers/constants'
import { getDragName, getDragType, onDragOver, onDropComp } from '#/ui/helpers/dragDrop'

const { getters: { currentLevelData, socialitesByTeam }, state, dropUnit, deleteUnit } = useStore()

const HEX_VW = `${HEX_SIZE_UNITS}vw`

const showingSocialite = computed(() => !state.didStart && Math.floor(state.setNumber) === 6)

function onDrop(event: DragEvent, hex: HexCoord) {
	const type = getDragType(event)
	const name = getDragName(event)
	if (name == null) return

	event.preventDefault()
	if (type === 'unit') {
		dropUnit(event, name, hex, undefined)
	} else if (type === 'comp') {
		onDropComp(name, hex)
	}
}

const hexForMenu = ref<HexCoord | null>(null)
const coordForMenu = computed(() => hexForMenu.value && getCoordFrom(hexForMenu.value))
const sourceHexForMenu = computed(() => hexForMenu.value && getMirrorHex(hexForMenu.value))

function onHexMenu(hex: HexCoord) {
	hexForMenu.value = showingSocialite.value ? hex : null
}

function setSocialite(socialiteIndex: number) {
	if (!sourceHexForMenu.value) return

	setSocialiteHex(socialiteIndex, isSameHex(state.socialiteHexes[socialiteIndex], sourceHexForMenu.value) ? null : sourceHexForMenu.value)
}

function onClearHexMenu(event?: Event) {
	event?.preventDefault()
	hexForMenu.value = null
}

const unitSize = `${100 * UNIT_SIZE_PROPORTION}%`

const saveCompCoord = computed(() => calculateCoordForHex(BOARD_COL_COUNT - 1, setData.rowsTotal))

function onSaveComp() {
	const name = window.prompt('Enter a name for this comp:')?.trim()
	if (name != null && name.length) {
		const units = toStorage(getUnitsOfTeam(0))
		setDataReactive.compsUser[name] = {
			augments: state.augmentsByTeam[1].map(augmentData => augmentData?.name ?? null),
			units,
		}
		saveComps(state.setNumber)
	}
}

const canSaveComp = computed(() => getUnitsOfTeam(0).length > 1)

function getUnitUnderMouse() {
	let n: HTMLElement | null = document.querySelector(":hover")
	while (n) {
		if (n.dataset.bench != null) {
			return parseInt(n.dataset.bench, 10)
		}
		if (n.dataset.hex != null) {
			return n.dataset.hex.split(',').map(n => parseInt(n, 10)) as HexCoord
		}
		n = n.querySelector(":hover")
	}
	return undefined
}
function onKey(event: KeyboardEvent) {
	if (event.key === 'e') {
		const unitLocation = getUnitUnderMouse()
		if (unitLocation != null) {
			deleteUnit(unitLocation)
		}
	} else if (event.key === 'w') {
		const unitLocation = getUnitUnderMouse()
		if (unitLocation != null) {
			if (typeof unitLocation === 'number') {
				if (getUnitsOfTeam(0).length >= currentLevelData.value[0]) {
					return
				}
				const hex = getClosestHexAvailableTo(getDefaultHexFor(0), state.units) //TODO use exact hexes from game
				const unit = state.benchUnits[unitLocation]
				if (hex && unit) {
					moveUnit(unit, hex, undefined)
				}
			} else {
				const unit = state.units.find(u => u.isAt(unitLocation))
				const benchIndex = state.benchUnits.findIndex(benchUnit => benchUnit == null)
				if (benchIndex !== -1 && unit) {
					moveUnit(unit, undefined, benchIndex)
				}
			}
		}
	}
}
onMounted(() => {
	document.addEventListener('keyup', onKey, false)
})
onBeforeUnmount(() => {
	document.removeEventListener('keyup', onKey, false)
})
</script>

<template>
<div class="board" :class="state.simMode" :style="{ marginTop: state.simMode === 'rolldown' ? `-${BOARD_UNITS_RAW * (setData.rowsPerSide / 10)}vw` : undefined }">
	<div class="relative">
		<div class="overflow-x-hidden aspect-square">
			<div v-if="state.simMode === 'rolldown'" class="available-slots  absolute inset-0 text-tertiary  flex justify-center items-center">
				{{ getUnitsOfTeam(0).length }} / {{ currentLevelData[0] }}
			</div>
			<template v-for="(row, rowIndex) in boardRowsCols" :key="rowIndex">
				<div
					v-for="colRow in row" v-show="rowIndex < setData.rowsTotal" :key="colRow.hex[1]"
					class="hex" :class="getTeamForRow(rowIndex) === 0 ? 'team-a' : 'team-b'"
					:style="{
						left: `${colRow.coord[0] * 100}%`, top: `${colRow.coord[1] * 100}%`,
						boxShadow: showingSocialite && socialitesByTeam[getTeamForRow(rowIndex)] && getSocialiteHexStrength(colRow.hex) > 0 ? `inset 0 0 ${3 - getSocialiteHexStrength(colRow.hex)}vw blue` : undefined
					}"
					@dragover="onDragOver" @drop="onDrop($event, colRow.hex)"
					@contextmenu.prevent="onHexMenu(colRow.hex)"
				/>
			</template>
			<button v-if="state.simMode === 'teamfight' && !state.didStart" :disabled="!canSaveComp" class="hex team-a" :style="{left: `${saveCompCoord[0] * 100}%`, top: `${saveCompCoord[1] * 100}%`}" @click="onSaveComp">
				<div class="hex-outline  bg-primary text-secondary  flex justify-center items-center">
					Save<br>Comp
				</div>
			</button>
		</div>
		<div class="absolute inset-0 pointer-events-none">
			<template v-for="unit in state.units" :key="unit.instanceID">
				<UnitCircle v-if="unit.hasCollision()" :unit="unit" />
			</template>
			<template v-for="unit in state.units" :key="unit.instanceID">
				<UnitOverlay v-if="unit.hasCollision()" :unit="unit" />
			</template>
			<transition-group name="fade">
				<template v-for="hexEffect in (state.hexEffects as unknown as Set<HexEffect>)" :key="hexEffect.instanceID">
					<HexEffectVue v-if="hexEffect.started" :effect="hexEffect" />
				</template>
			</transition-group>
			<template v-for="projectileEffect in (state.projectileEffects as unknown as Set<ProjectileEffect>)" :key="projectileEffect.instanceID">
				<ProjectileEffectVue v-if="projectileEffect.started" :effect="projectileEffect" />
			</template>
			<transition-group name="fade">
				<template v-for="shapeEffect in (state.shapeEffects as unknown as Set<ShapeEffect>)" :key="shapeEffect.instanceID">
					<ShapeEffectVue v-if="shapeEffect.started" :effect="shapeEffect" />
				</template>
			</transition-group>
			<transition-group name="fade">
				<template v-for="targetEffect in (state.targetEffects as unknown as Set<TargetEffect>)" :key="targetEffect.instanceID">
					<template v-if="targetEffect.started">
						<TargetEffectVue v-for="(sourceTarget, index) in targetEffect.sourceTargets" :key="index" :effect="targetEffect" :sourceTarget="sourceTarget" />
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
.rolldown .hex.team-b {
	@apply opacity-0;
}
.rolldown .hex-unit.team-b {
	@apply opacity-0 !important;
}

.available-slots {
	font-size: 12vw;
}

.board, .hex, .hex-unit {
	transition-property: margin, opacity;
	transition-duration: 600ms;
}

.hex {
	width: v-bind(HEX_VW);
}
.hex, .hex-outline {
	height: v-bind(HEX_VW);
	clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
}
.board .hex-unit {
	@apply absolute z-20;
}
.hex-unit {
	width: v-bind(unitSize);
	height: v-bind(unitSize);
}
.board .hex-overlay {
	transform: translate(-50%, -50%);
}
.bg-team-a {
	@apply bg-violet-700;
}
.bg-team-b {
	@apply bg-rose-700;
}
.border-team-a {
	@apply border-violet-500;
}
.border-team-b {
	@apply border-rose-500;
}
.fill-team-a {
	@apply text-violet-300;
}
.fill-team-b {
	@apply text-rose-300;
}
.text-team-a {
	@apply text-violet-500;
}
.text-team-b {
	@apply text-rose-500;
}
.hex-outline {
	@apply absolute inset-0 w-[94%] h-[94%] m-auto;
}
.hex-outline > * {
	@apply absolute inset-0 z-50;
}

.hex.team-a, .bench-space {
	@apply bg-violet-300/25;
}
.hex.team-b {
	@apply bg-rose-300/25;
}
</style>

<style scoped lang="postcss">
.hex {
	@apply absolute;
	transform: translate(-50%, -50%)
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
.hex-button {
	@apply mx-1 rounded-full;
	font-size: 1.3vw;
}
.hex-outline {
	font-size: 1.7vw;
}
.hex:disabled {
	@apply opacity-25;
}
</style>
