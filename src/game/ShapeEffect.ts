import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/GameEffect'
import type { GameEffectData } from '#/game/GameEffect'

import { getAngleBetween, doesLineInterceptCircle, radianDistance } from '#/helpers/angles'
import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS, HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT, UNIT_SIZE_PROPORTION } from '#/helpers/constants'
import type { HexCoord } from '#/helpers/types'
import { coordinateDistanceSquared, hexDistanceFrom } from '#/helpers/boardUtils'

class ShapeEffectShape {
	intersects: (unit: ChampionUnit) => boolean = () => false
	styles: () => Record<string, string> = () => { return {} }
}

export interface ShapeEffectData extends GameEffectData {
	/** The coordinate area to hit-test against. */
	shape: ShapeEffectShape
}

export class ShapeEffect extends GameEffect {
	shape: ShapeEffectShape

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: ShapeEffectData) {
		super(source, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		this.shape = data.shape

		this.postInit()
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		return wasSpellShielded
	}

	intersects = (unit: ChampionUnit) => {
		return this.shape.intersects(unit)
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult != null) { return updateResult }
		this.checkCollision(elapsedMS, units)
	}
}

export class ShapeEffectCone implements ShapeEffectShape {
	centerCoordinate: HexCoord
	direction: number
	radius: number
	arcRadians: number

	constructor(centerCoordinate: HexCoord, direction: number, radius: number, arcRadians: number) {
		this.centerCoordinate = centerCoordinate
		this.direction = direction
		this.radius = radius
		this.arcRadians = arcRadians
	}

	intersects(unit: ChampionUnit) {
		let testAngle = getAngleBetween(this.centerCoordinate, unit.coordinatePosition())
		const minDistance = radianDistance(this.direction, testAngle)
		if (Math.abs(minDistance) > this.arcRadians / 2) {
			testAngle = this.direction + this.arcRadians / 2 * (minDistance > 0 ? 1 : -1)
		}
		const startPoint = this.centerCoordinate
		const lineDelta: HexCoord = [Math.cos(testAngle) * this.radius * HEX_PROPORTION_PER_LEAGUEUNIT, Math.sin(testAngle) * this.radius * HEX_PROPORTION_PER_LEAGUEUNIT]
		return doesLineInterceptCircle(unit.coordinatePosition(), UNIT_SIZE_PROPORTION / 2, startPoint, lineDelta)
	}

	styles() {
		const [left, top] = this.centerCoordinate
		return {
			borderRadius: '100%',
			left: `${left * 100}%`,
			top: `${top * 100}%`,
			width: `${this.radius * HEX_PROPORTION}%`,
			height: `${this.radius * HEX_PROPORTION}%`,
			transformOrigin: '50% 50%',
			transform: `translate(-50%, -50%) rotate(${this.direction - this.arcRadians / 2 + Math.PI / 2}rad)`,
			backgroundImage: `conic-gradient(currentColor ${this.arcRadians}rad, transparent 0)`,
		}
	}
}

export class ShapeEffectCircle implements ShapeEffectShape {
	centerCoordinate: HexCoord
	radius: number
	maxDistanceSquared: number

	constructor(centerCoordinate: HexCoord, radius: number) {
		this.centerCoordinate = centerCoordinate
		this.radius = radius
		const maxDistance = this.radius * HEX_PROPORTION_PER_LEAGUEUNIT + UNIT_SIZE_PROPORTION / 2
		this.maxDistanceSquared = maxDistance * maxDistance
	}

	intersects(unit: ChampionUnit) {
		return coordinateDistanceSquared(this.centerCoordinate, unit.coordinatePosition()) < this.maxDistanceSquared
	}

	styles() {
		const [left, top] = this.centerCoordinate
		return {
			borderRadius: '100%',
			left: `${left * 100}%`,
			top: `${top * 100}%`,
			width: `${this.radius * HEX_PROPORTION}%`,
			height: `${this.radius * HEX_PROPORTION}%`,
			transform: `translate(-50%, -50%)`,
			background: `currentColor`,
		}
	}
}
