let frameID: number | null = null

import { useStore } from '#/game/board'
import { updatePaths } from '#/game/pathfinding'

const { state } = useStore()

let startedAtMS: DOMHighResTimeStamp = 0

const MOVE_LOCKOUT_JUMPERS_MS = 500
const MOVE_LOCKOUT_MELEE_MS = 1000

let didBacklineJump = false

export function runLoop(frameMS: DOMHighResTimeStamp, unanimated?: boolean) {
	const isFirstLoop = !startedAtMS
	if (isFirstLoop) {
		startedAtMS = frameMS
		updatePaths(state.units)
		didBacklineJump = false
	}
	const elapsedMS = frameMS - startedAtMS
	if (elapsedMS >= MOVE_LOCKOUT_JUMPERS_MS) {
		didBacklineJump = true
	}
	for (const unit of state.units) {
		if (unit.dead || unit.isMoving(frameMS)) {
			continue
		}
		if (didBacklineJump) {
			unit.updateTarget(state.units)
		}
		if (unit.target) {
			unit.updateAttack(frameMS, state.units)
		} else {
			if (elapsedMS < MOVE_LOCKOUT_MELEE_MS) {
				if (!didBacklineJump) {
					if (!unit.jumpsToBackline()) {
						continue
					}
					unit.jumpToBackline(frameMS, state.units)
					continue
				} else if (unit.range() > 1) {
					continue
				}
			}
			unit.updateMove(frameMS, state.units)
		}
	}
	if (isFirstLoop) {
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
