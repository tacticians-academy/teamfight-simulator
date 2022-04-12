import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { GameEffect } from '#/sim/effects/GameEffect'
import type { GameEffectData } from '#/sim/effects/GameEffect'

import { getHexesSurroundingWithin } from '#/sim/helpers/board'
import type { SurroundingHexRange } from '#/sim/helpers/board'
import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS } from '#/sim/helpers/constants'
import type { HexCoord } from '#/sim/helpers/types'

export interface HexEffectData extends GameEffectData {
	/** Hexes to apply the effect to. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexes?: HexCoord[]
	/** Distance from the source unit that this HexEffect applies to at the time of activation. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexDistanceFromSource?: SurroundingHexRange
	/** A custom unit for `hexDistanceFromSource` to originate from (defaults to `source`). */
	hexSource?: ChampionUnit | HexCoord
	/** The interval to re-apply the effect to units inside it, until it expires. */
	ticksEveryMS?: DOMHighResTimeStamp
	/** Taunts affected units to the source unit. */
	taunts?: boolean
}

export class HexEffect extends GameEffect {
	hexes: HexCoord[] | undefined
	hexDistanceFromSource: SurroundingHexRange | undefined
	hexSource: ChampionUnit | HexCoord | undefined
	ticksEveryMS: DOMHighResTimeStamp | undefined
	taunts: boolean

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: HexEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)

		this.hexes = data.hexes
		this.hexDistanceFromSource = data.hexDistanceFromSource
		this.hexSource = data.hexSource
		this.ticksEveryMS = data.ticksEveryMS
		this.taunts = data.taunts ?? false
	}

	start = () => {
		if (!this.hexes) {
			const source = this.hexSource ?? this.source
			const sourceHex = 'activeHex' in source ? source.activeHex : source
			if (this.hexDistanceFromSource) {
				this.hexes = getHexesSurroundingWithin(sourceHex, this.hexDistanceFromSource, true)
			} else {
				console.warn('Must provide `hexes` or `hexDistanceFromSource`')
			}
		}
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFinalTarget: boolean) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (this.taunts && unit.team !== this.source.team && this.source.isAttackable()) {
			unit.setTarget(this.source)
		}
		return true
	}

	intersects = (unit: ChampionUnit) => {
		return unit.isIn(this.hexes!)
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS)
		if (updateResult != null) { return updateResult }
		this.checkCollision(elapsedMS, units)
		if (this.ticksEveryMS != null) {
			this.collidedWith = []
			this.activatesAtMS += this.ticksEveryMS
		}
	}
}
