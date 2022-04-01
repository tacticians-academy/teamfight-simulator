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
	hexSource?: ChampionUnit | HexCoord
	/** Taunts affected units to the source unit. */
	taunts?: boolean
}

const MIN_ACTIVATION_TIME = 50

export class HexEffect extends GameEffect {
	hexes: Ref<HexCoord[] | undefined>
	hexDistanceFromSource: number | undefined
	hexSource: ChampionUnit | HexCoord | undefined
	taunts: boolean

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: HexEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		const remainingMinimumActivation = MIN_ACTIVATION_TIME - this.activatesAfterMS
		if (remainingMinimumActivation > 0) {
			this.startsAtMS -= remainingMinimumActivation
			this.activatesAfterMS += remainingMinimumActivation
		}
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
			const source = this.hexSource ?? this.source
			const sourceHex = 'activeHex' in source ? source.activeHex : source
			const hexes = getSurroundingWithin(sourceHex, this.hexDistanceFromSource!, true)
			this.hexes.value = hexes
		}
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFinalTarget: boolean) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (this.taunts && this.source.isInteractable()) {
			unit.setTarget(this.source)
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
