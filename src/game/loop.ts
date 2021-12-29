let frameID: number | null = null

import { useStore } from '#/game/board'
import { getSurrounding } from '#/game/boardUtils'

const { state } = useStore()

export function runLoop(animated: DOMHighResTimeStamp | false) {
	for (const unit of state.units) {
		getSurrounding(unit.currentPosition())
	}
	if (animated !== false) {
		frameID = window.requestAnimationFrame(runLoop)
	} else {
		runLoop(false)
	}
}

export function cancelLoop() {
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
