<script setup lang="ts">
import HexEffect from '#/components/HexEffect.vue'
import Unit from '#/components/Unit.vue'
import Projectile from '#/components/Projectile.vue'

import { computed, onMounted, ref } from 'vue'

import { useStore, coordinatePosition, getSocialiteHexStrength, setSocialiteHex } from '#/game/store'
import { getDragNameOf, onDragOver } from '#/game/dragDrop'

import { getMirrorHex, isSameHex } from '#/helpers/boardUtils'
import { BOARD_ROW_PER_SIDE_COUNT, HALF_HEX_UNITS, HALF_HEX_BORDER_UNITS, HEX_BORDER_UNITS, HEX_UNITS, QUARTER_HEX_INSET_UNITS } from '#/helpers/constants'
import type { HexCoord } from '#/helpers/types'
import { TraitKey } from '@tacticians-academy/academy-library/dist/set6/traits'

const hexContainer = ref<HTMLElement | null>(null)

const { getters, state, dropUnit, loadUnits } = useStore()

function onDrop(event: DragEvent, row: number, col: number) {
	const championName = getDragNameOf('unit', event)
	if (championName == null) {
		return
	}
	event.preventDefault()
	dropUnit(event, championName, [col, row])
}

const hexForMenu = ref<HexCoord | null>(null)
const sourceHexForMenu = computed(() => hexForMenu.value && getMirrorHex(hexForMenu.value))

function onHexMenu(event: Event, hex: HexCoord) {
	event.preventDefault()
	if (!state.isRunning) {
		hexForMenu.value = hex
	}
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
			state.hexRowsCols[rowIndex][colIndex].position = [x / containerSize, y / containerSize]
		}
	}

	loadUnits()
})

const socialitesByTeam = getters.socialitesByTeam
</script>

<template>
<div class="board  overflow-y-scroll">
	<div class="relative">
		<div ref="hexContainer" class="hexes-container">
			<div v-for="(row, rowIndex) in state.hexRowsCols" :key="rowIndex" class="row" :class="rowIndex % 2 === 1 && 'row-alt'">
				<div
					v-for="(col, colIndex) in row" :key="colIndex"
					class="hex" :class="rowIndex < BOARD_ROW_PER_SIDE_COUNT ? 'team-a' : 'team-b'"
					:style="{ boxShadow: !state.isRunning && socialitesByTeam[rowIndex < BOARD_ROW_PER_SIDE_COUNT ? 0 : 1] && getSocialiteHexStrength([colIndex, rowIndex]) > 0 ? `inset 0 0 ${3 - getSocialiteHexStrength([colIndex, rowIndex])}vw blue` : undefined }"
					@dragover="onDragOver" @drop="onDrop($event, rowIndex, colIndex)"
					@contextmenu="onHexMenu($event, [colIndex, rowIndex])"
				/>
			</div>
		</div>
		<div class="absolute inset-0 pointer-events-none">
			<template v-for="unit in state.units" :key="unit.instanceID">
				<Unit v-if="!unit.dead" :unit="unit" />
			</template>
			<transition-group name="hexEffect">
				<template v-for="hexEffect in state.hexEffects" :key="hexEffect.instanceID">
					<HexEffect :hexEffect="hexEffect" />
				</template>
			</transition-group>
			<template v-for="projectile in state.projectiles" :key="projectile.instanceID">
				<Projectile :projectile="projectile" />
			</template>
			<div
				v-if="hexForMenu && !state.isRunning"
				class="hex hex-overlay  pointer-events-auto absolute bg-tertiary text-primary  flex flex-col justify-center space-y-1"
				:style="{ left: `${coordinatePosition(hexForMenu)[0] * 100}%`, top: `${coordinatePosition(hexForMenu)[1] * 100}%` }"
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
.hexes-container { /* TODO work on small screen sizes */
	@apply aspect-square;
}
.hex {
	width: v-bind(HEX_UNITS);
	height: v-bind(HEX_UNITS);
	clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
}
.hex-overlay {
	transform: translate(-50%, -50%);
}
.hex.team-a {
	@apply bg-violet-300/25;
}
.hex.team-b {
	@apply bg-rose-300/25;
}
</style>

<style scoped lang="postcss">
.hexEffect-leave-active {
	transition: opacity 1500ms !important;
}
.hexEffect-enter-from, .hexEffect-leave-to {
	opacity: 0 !important;
}
</style>

<style scoped lang="postcss">
.board {
	@apply relative w-full overflow-x-hidden;
}

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
