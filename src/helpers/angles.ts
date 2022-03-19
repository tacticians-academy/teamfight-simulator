import type { HexCoord } from '#/helpers/types'

const pi2 = Math.PI * 2

export function toRadians(degrees: number) {
	return degrees * Math.PI / 180
}

export function radianDistance(a: number, b: number) {
	return (b - a) % pi2
}

export function getAngleBetween([sourceX, sourceY]: HexCoord, [targetX, targetY]: HexCoord) {
	return Math.atan2(targetY - sourceY, targetX - sourceX)
}

export function doesLineInterceptCircle([circleX, circleY]: HexCoord, circleRadius: number, [lineStartX, lineStartY]: HexCoord, [lineDeltaX, lineDeltaY]: HexCoord) {
	const lineStartToCircleX = lineStartX - circleX
	const lineStartToCircleY = lineStartY - circleY
	const b = -2 * (lineDeltaX * lineStartToCircleX + lineDeltaY * lineStartToCircleY)
	const c = 2 * (lineDeltaX * lineDeltaX + lineDeltaY * lineDeltaY)
	const d = Math.sqrt(b * b - 2 * c * (lineStartToCircleX * lineStartToCircleX + lineStartToCircleY * lineStartToCircleY - circleRadius * circleRadius))
	if (isNaN(d)) {
		return false
	}
	const unitDistance1 = (b - d) / c
	const unitDistance2 = (b + d) / c
	return unitDistance1 <= 1 && unitDistance1 >= 0 || unitDistance2 <= 1 && unitDistance2 >= 0
}
