import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { GameEffectData } from '#/game/effects/GameEffect'

import { getAngleBetween, doesLineInterceptCircle, radianDistance, doesRectangleInterceptCircle } from '#/helpers/angles'
import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS, HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT, UNIT_SIZE_PROPORTION } from '#/helpers/constants'
import type { HexCoord } from '#/helpers/types'
import { coordinateDistanceSquared } from '#/helpers/boardUtils'

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
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		this.shape = data.shape

		this.postInit()
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFinalTarget: boolean) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (wasSpellShielded == null) { return false }
		return true
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
	coord: HexCoord
	direction: number
	radius: number
	arcRadians: number

	constructor(source: ChampionUnit, direction: number, radius: number, arcRadians: number) {
		this.coord = source.coord
		this.direction = direction
		this.radius = radius
		this.arcRadians = arcRadians
	}

	intersects(unit: ChampionUnit) {
		let testAngle = getAngleBetween(this.coord, unit.coord)
		const minDistance = radianDistance(this.direction, testAngle)
		if (Math.abs(minDistance) > this.arcRadians / 2) {
			testAngle = this.direction + this.arcRadians / 2 * (minDistance > 0 ? 1 : -1)
		}
		const startPoint = this.coord
		const lineDelta: HexCoord = [Math.cos(testAngle) * this.radius * HEX_PROPORTION_PER_LEAGUEUNIT, Math.sin(testAngle) * this.radius * HEX_PROPORTION_PER_LEAGUEUNIT]
		return doesLineInterceptCircle(unit.coord, UNIT_SIZE_PROPORTION / 2, startPoint, lineDelta)
	}

	styles() {
		const [left, top] = this.coord
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
	coord: HexCoord
	radius: number
	maxDistanceSquared: number

	constructor(source: ChampionUnit, radius: number) {
		this.coord = source.coord
		this.radius = radius
		const maxDistance = this.radius * HEX_PROPORTION_PER_LEAGUEUNIT + UNIT_SIZE_PROPORTION / 2
		this.maxDistanceSquared = maxDistance * maxDistance
	}

	intersects(unit: ChampionUnit) {
		return coordinateDistanceSquared(this.coord, unit.coord) < this.maxDistanceSquared
	}

	styles() {
		const [left, top] = this.coord
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

export class ShapeEffectRectangle implements ShapeEffectShape {
	coord: HexCoord
	size: HexCoord

	constructor(coord: HexCoord, size: HexCoord) {
		this.coord = coord
		this.size = size
	}

	intersects(unit: ChampionUnit) {
		return doesRectangleInterceptCircle(unit.coord, UNIT_SIZE_PROPORTION / 2, this.coord, this.size)
	}

	styles() {
		const [left, top] = this.coord
		return {
			left: `${left * 100}%`,
			top: `${top * 100}%`,
			width: `${this.size[0] * 100}%`,
			height: `${this.size[1] * 100}%`,
			transform: `translate(-50%, -50%)`,
			background: `currentColor`,
		}
	}
}
