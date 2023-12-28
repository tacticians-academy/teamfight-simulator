<script setup lang="ts">
import HexEffect from '#/ui/components/Effects/HexEffect.vue'
import ProjectileEffect from '#/ui/components/Effects/ProjectileEffect.vue'
import ShapeEffect from '#/ui/components/Effects/ShapeEffect.vue'
import TargetEffect from '#/ui/components/Effects/TargetEffect.vue'
import UnitCircle from '#/ui/components/UnitCircle.vue'
import UnitOverlay from '#/ui/components/UnitOverlay.vue'

import { computed, ref } from 'vue'

import { useStore, getSocialiteHexStrength, setSocialiteHex, setDataReactive } from '#/store/store'
import { saveComps } from '#/store/storage'

import { boardRowsCols, calculateCoordForHex, getCoordFrom } from '#/sim/helpers/board'
import { getMirrorHex, getTeamForRow, isSameHex } from '#/sim/helpers/hexes'
import type { HexCoord } from '#/sim/helpers/types'

import { BOARD_UNITS_RAW, HEX_SIZE_UNITS } from '#/ui/helpers/constants'
import { getDragName, getDragType, onDragOver, onDropComp } from '#/ui/helpers/dragDrop'
import { BOARD_COL_COUNT, UNIT_SIZE_PROPORTION } from '#/sim/helpers/constants'
import { toStorage } from '#/store/storage'
import { getUnitsOfTeam } from '#/sim/helpers/effectUtils'

const { getters, state, dropUnit } = useStore()

const HEX_VW = `${HEX_SIZE_UNITS}vw`

const showingSocialite = computed(() => !state.didStart && Math.floor(state.setNumber) === 6)

function onDrop(event: DragEvent, hex: HexCoord) {
	const type = getDragType(event)
	const name = getDragName(event)
	if (name == null) return

	event.preventDefault()
	if (type === 'unit') {
		dropUnit(event, name, hex)
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

const saveCompCoord = computed(() => calculateCoordForHex(BOARD_COL_COUNT - 1, state.rowsTotal))

function onSaveComp() {
	const name = window.prompt('Enter a name for this comp:')?.trim()
	if (name != null && name.length) {
		const units = toStorage(getUnitsOfTeam(1))
		setDataReactive.compsUser[name] = {
			augments: state.augmentsByTeam[1].map(augmentData => augmentData?.name ?? null),
			units,
		}
		saveComps(state.setNumber)
	}
}

const canSaveComp = computed(() => state.units.filter(u => u.team === 0).length > 1)
</script>

<template>
<div class="board" :class="state.simMode" :style="{ marginTop: state.simMode === 'rolldown' ? `-${BOARD_UNITS_RAW * (state.rowsPerSide / 10)}vw` : undefined }">
	<div class="relative">
		<div class="overflow-x-hidden aspect-square">
			<template v-for="(row, rowIndex) in boardRowsCols" :key="rowIndex">
				<div
					v-for="colRow in row" v-show="rowIndex < state.rowsTotal" :key="colRow.hex[1]"
					class="hex" :class="getTeamForRow(rowIndex) === 0 ? 'team-a' : 'team-b'"
					:style="{
						left: `${colRow.coord[0] * 100}%`, top: `${colRow.coord[1] * 100}%`,
						boxShadow: showingSocialite && getters.socialitesByTeam.value[getTeamForRow(rowIndex)] && getSocialiteHexStrength(colRow.hex) > 0 ? `inset 0 0 ${3 - getSocialiteHexStrength(colRow.hex)}vw blue` : undefined
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
.rolldown .hex.team-b {
	@apply opacity-0;
}
.rolldown .hex-unit.team-b {
	@apply opacity-0 !important;
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
.hex-unit {
	@apply absolute z-20;
	width: v-bind(unitSize);
	height: v-bind(unitSize);
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
</style>

<style scoped lang="postcss">
.hex {
	@apply absolute;
	transform: translate(-50%, -50%)
}
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
