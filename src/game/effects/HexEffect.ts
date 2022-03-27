import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { GameEffectData } from '#/game/effects/GameEffect'

import { getSurroundingWithin } from '#/helpers/boardUtils'
import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS } from '#/helpers/constants'
import type { HexCoord } from '#/helpers/types'

export interface HexEffectData extends GameEffectData {
	/** Hexes to apply the effect to. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexes?: HexCoord[]
	/** Distance from the source unit that this HexEffect applies to at the time of activation. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexDistanceFromSource?: number
	/** A custom unit for `hexDistanceFromSource` to originate from (defaults to `source`). */
	hexSource?: ChampionUnit
	/** Taunts affected units to the source unit. */
	taunts?: boolean
}

export class HexEffect extends GameEffect {
	hexes: Ref<HexCoord[] | undefined>
	hexDistanceFromSource: number | undefined
	hexSource: ChampionUnit | undefined
	taunts: boolean

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: HexEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)

		this.hexes = ref(data.hexes)
		this.hexDistanceFromSource = data.hexDistanceFromSource
		this.hexSource = data.hexSource
		this.taunts = data.taunts ?? false

		this.postInit()
	}

	start = () => {
		if (!this.hexes.value) {
			const sourceHex = (this.hexSource ?? this.source).activeHex
			const hexes = getSurroundingWithin(sourceHex, this.hexDistanceFromSource!)
			hexes.push(sourceHex)
			this.hexes.value = hexes
		}
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFinalTarget: boolean) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (wasSpellShielded == null) { return false }
		if (this.taunts && this.source.isInteractable()) {
			unit.target = this.source
		}
		return true
	}

	intersects = (unit: ChampionUnit) => {
		return unit.isIn(this.hexes.value!)
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult != null) { return updateResult }
		this.checkCollision(elapsedMS, units)
	}
}
