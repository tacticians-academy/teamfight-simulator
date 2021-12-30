let frameID: number | null = null

import { useStore } from '#/game/board'
import { updatePaths } from '#/game/pathfinding'

const { state } = useStore()

let startedAtMS: DOMHighResTimeStamp = 0

const MOVE_LOCKOUT_JUMPERS_MS = 300
const MOVE_LOCKOUT_MELEE_MS = 500

export function runLoop(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	if (!startedAtMS) {
		startedAtMS = frameMS
		updatePaths(state.units)
	}
	const elapsedMS = frameMS - startedAtMS
	let didUnitMove = false
	for (const unit of state.units) {
		if (unit.dead || unit.isMoving(frameMS)) {
			continue
		}
		unit.updateTarget(state.units)
		if (unit.target) {
			unit.updateAttack(frameMS)
		} else {
			if (elapsedMS < MOVE_LOCKOUT_MELEE_MS) {
				if (elapsedMS < MOVE_LOCKOUT_JUMPERS_MS) {
					if (!unit.jumpsToBackline()) {
						continue
					}
					//TODO jump
					continue
				} else if (unit.range() > 1) {
					continue
				}
			}
			if (unit.updateMove(frameMS)) {
				didUnitMove = true
			}
		}
	}
	if (didUnitMove) {
		updatePaths(state.units)
	}
	if (unanimated === true) {
		runLoop(frameMS + 60, true)
	} else {
		frameID = window.requestAnimationFrame(runLoop)
	}
}

export function cancelLoop() {
	startedAtMS = 0
	if (frameID !== null) {
		window.cancelAnimationFrame(frameID)
		frameID = null
	}
}
