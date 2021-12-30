let frameID: number | null = null

import { useStore } from '#/game/board'
import { updatePaths } from '#/game/pathfinding'

const { state } = useStore()

let startTime: DOMHighResTimeStamp = 0

export function runLoop(frameTiming: DOMHighResTimeStamp, unanimated?: boolean) {
	if (!startTime) {
		startTime = frameTiming
		updatePaths(state.units)
	}
	for (const unit of state.units) {
		unit.updateTarget(state.units)
		unit.updateAttack(frameTiming)
	}
	if (unanimated === true) {
		runLoop(startTime + 60, true)
	} else {
		frameID = window.requestAnimationFrame(runLoop)
	}
}

export function cancelLoop() {
	startTime = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
