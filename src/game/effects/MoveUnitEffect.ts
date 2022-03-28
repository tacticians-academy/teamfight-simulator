import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { GameEffectData } from '#/game/effects/GameEffect'

import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS } from '#/helpers/constants'
import type { CollisionFn, HexCoord } from '#/helpers/types'
import { state } from '#/game/store'
import { getClosestHexAvailableTo } from '#/helpers/boardUtils'
import type { HexEffectData } from '#/game/effects/HexEffect'

type CalculateDestinationFn = (target: ChampionUnit) => HexCoord | null | undefined

export interface MoveUnitEffectData extends GameEffectData {
	/** Unit to apply this effect to. */
	target?: ChampionUnit
	/** The speed the target moves to the destination at. Defaults to the target's move speed if undefined. */
	moveSpeed: number | undefined
	/** Calculate the ideal destination `HexCoord`. */
	idealDestination: CalculateDestinationFn
	/** Creates a `HexEffect` upon completion. */
	hexEffect?: HexEffectData
	/** Called when the target reaches the destination `HexCoord`. */
	onDestination?: CollisionFn
}

export class MoveUnitEffect extends GameEffect {
	target: ChampionUnit
	moveSpeed: number | undefined
	idealDestination: CalculateDestinationFn
	hexEffect: HexEffectData | undefined
	onDestination: CollisionFn | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: MoveUnitEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)

		this.target = data.target!
		this.moveSpeed = data.moveSpeed
		this.idealDestination = data.idealDestination
		this.hexEffect = data.hexEffect
		this.onDestination = data.onDestination

		this.postInit()
	}

	start = () => {
		if (!this.target.isInteractable()) {
			return
		}
		const spellShield = this.target.consumeSpellShield()
		if (spellShield == null) {
			const idealHex = this.idealDestination(this.target)
			if (idealHex) {
				const bestHex = getClosestHexAvailableTo(idealHex, state.units)
				if (bestHex) {
					this.target.customMoveTo(bestHex, 1000, this.apply)
				}
			}
		}
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (wasSpellShielded == null) { return false }
		if (!wasSpellShielded) {
			if (this.hexEffect) {
				this.source.queueHexEffect(elapsedMS, undefined, this.hexEffect)
			}
			this.onDestination?.(elapsedMS, unit)
		}
		return true
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult != null) { return updateResult }
		return true
	}
}
