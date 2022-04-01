import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { GameEffectData } from '#/game/effects/GameEffect'

import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS, UNIT_SIZE_PROPORTION } from '#/helpers/constants'
import type { ActivateFn, HexCoord } from '#/helpers/types'
import { state } from '#/game/store'
import { coordinateDistanceSquared } from '#/helpers/boardUtils'
import type { HexEffectData } from '#/game/effects/HexEffect'

type CalculateDestinationFn = (target: ChampionUnit) => ChampionUnit | HexCoord | null | undefined

export interface MoveUnitEffectData extends GameEffectData {
	/** Unit to apply this effect to. */
	target?: ChampionUnit
	/** If the source should move with the `target`. */
	movesWithTarget?: boolean
	/** If the `target` should be not be updated after moving. */
	keepsTarget?: boolean
	/** The speed the `target` moves to the destination at. Defaults to the `target`'s move speed if undefined. */
	moveSpeed: number | undefined
	/** Ignore collision when setting a destination hex. */
	ignoresDestinationCollision?: boolean
	/** Calculate the ideal destination `HexCoord`. */
	idealDestination: CalculateDestinationFn
	/** Creates a `HexEffect` upon completion. */
	hexEffect?: HexEffectData
	/** Increases the collision size for checking `onCollision`. */
	collisionSizeMultiplier?: number
	/** Called when the `target` reaches the destination `HexCoord`. */
	onDestination?: ActivateFn
}

export class MoveUnitEffect extends GameEffect {
	target: ChampionUnit
	movesWithTarget: boolean
	keepsTarget: boolean
	moveSpeed: number | undefined
	ignoresDestinationCollision: boolean
	idealDestination: CalculateDestinationFn
	hexEffect: HexEffectData | undefined
	collisionSizeMultiplier: number | undefined
	onDestination: ActivateFn | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: MoveUnitEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS != null ? data.expiresAfterMS : 60 * 1000)

		this.target = data.target!
		this.movesWithTarget = data.movesWithTarget ?? false
		this.keepsTarget = data.keepsTarget ?? false
		this.moveSpeed = data.moveSpeed
		this.ignoresDestinationCollision = data.ignoresDestinationCollision ?? false
		this.idealDestination = data.idealDestination
		this.hexEffect = data.hexEffect
		this.collisionSizeMultiplier = data.collisionSizeMultiplier
		this.onDestination = data.onDestination

		this.postInit()
	}

	start = () => {
		if (!this.target.isInteractable()) {
			return
		}
		const spellShield = this.target.consumeSpellShield()
		if (spellShield == null) {
			const destination = this.idealDestination(this.target)
			if (destination) {
				const moveSpeed = this.moveSpeed ?? this.target.moveSpeed()
				this.target.customMoveTo(destination, !this.ignoresDestinationCollision, moveSpeed, this.keepsTarget, this.apply)
				if (this.movesWithTarget) {
					this.source.customMoveTo(destination, true, moveSpeed, this.keepsTarget)
				}
			}
		}
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		if (!wasSpellShielded) {
			if (this.hexEffect) {
				this.source.queueHexEffect(elapsedMS, undefined, this.hexEffect)
			}
		}
		this.expiresAtMS = elapsedMS
		this.onDestination?.(elapsedMS, unit)
		return true
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult != null) { return updateResult }
		if (this.onCollision) {
			const collisionRadius = (UNIT_SIZE_PROPORTION * (this.collisionSizeMultiplier != null ? this.collisionSizeMultiplier : 1) + UNIT_SIZE_PROPORTION) / 2
			const collisionRadiusSquared = collisionRadius * collisionRadius
			for (const unit of state.units) {
				if (unit === this.target || unit.team !== this.targetTeam || this.collidedWith.includes(unit.instanceID)) {
					continue
				}
				if (coordinateDistanceSquared(unit.coord, this.target.coord) <= collisionRadiusSquared) {
					this.collidedWith.push(unit.instanceID)
					this.onCollision(elapsedMS, this, unit)
				}
			}
		}
		return true
	}
}
