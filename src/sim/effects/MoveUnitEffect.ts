import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import { state } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { GameEffect } from '#/sim/effects/GameEffect'
import type { GameEffectData } from '#/sim/effects/GameEffect'
import type { HexEffectData } from '#/sim/effects/HexEffect'

import { coordinateDistanceSquared } from '#/sim/helpers/board'
import { DEFAULT_CAST_SECONDS, UNIT_SIZE_PROPORTION } from '#/sim/helpers/constants'
import type { ActivateFn, HexCoord } from '#/sim/helpers/types'

type CalculateDestinationFn = (target: ChampionUnit) => ChampionUnit | HexCoord | null | undefined

export interface MoveUnitEffectData extends GameEffectData {
	/** Unit to apply this effect to. */
	target?: ChampionUnit
	/** If the source should move with the `target`. */
	movesWithTarget?: boolean
	/** If the `target`'s attack target should be not be updated after moving. */
	keepsAttackTarget?: boolean
	/** The speed the `target` moves to the destination at. Defaults to the `target`'s move speed if undefined. */
	moveSpeed: number | undefined
	/** Ignore collision when setting a destination hex. */
	ignoresDestinationCollision?: boolean
	/** Calculate the ideal destination `HexCoord`. */
	idealDestination: CalculateDestinationFn
	/** Creates a `HexEffect` upon completion. */
	hexEffect?: HexEffectData
	/** Increases the collision size for checking `onCollided`. */
	collisionSizeMultiplier?: number
	/** Called when the `target` reaches the destination `HexCoord`. */
	onDestination?: ActivateFn
}

export class MoveUnitEffect extends GameEffect {
	target: ChampionUnit
	movesWithTarget: boolean
	keepsAttackTarget: boolean
	moveSpeed: number | undefined
	ignoresDestinationCollision: boolean
	idealDestination: CalculateDestinationFn
	hexEffect: HexEffectData | undefined
	collisionSizeMultiplier: number | undefined
	onDestination: ActivateFn | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: MoveUnitEffectData) {
		if (!data.target) throw 'Target must be provided'
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS != null ? data.expiresAfterMS : 60 * 1000)

		this.target = data.target
		this.movesWithTarget = data.movesWithTarget ?? false
		this.keepsAttackTarget = data.keepsAttackTarget ?? false
		this.moveSpeed = data.moveSpeed
		this.ignoresDestinationCollision = data.ignoresDestinationCollision ?? false
		this.idealDestination = data.idealDestination
		this.hexEffect = data.hexEffect
		this.collisionSizeMultiplier = data.collisionSizeMultiplier
		this.onDestination = data.onDestination
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
				this.target.customMoveTo(destination, !this.ignoresDestinationCollision, moveSpeed, this.keepsAttackTarget, this.apply)
				if (this.movesWithTarget) {
					this.source.customMoveTo(destination, true, moveSpeed, this.keepsAttackTarget)
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
		const updateResult = this.updateSuper(elapsedMS)
		if (updateResult != null) { return updateResult }
		if (this.onCollided) {
			const collisionRadius = (UNIT_SIZE_PROPORTION * (this.collisionSizeMultiplier != null ? this.collisionSizeMultiplier : 1) + UNIT_SIZE_PROPORTION) / 2
			const collisionRadiusSquared = collisionRadius * collisionRadius
			for (const unit of state.units) {
				if (unit === this.target || unit.team !== this.targetTeam || this.collidedWith.includes(unit.instanceID)) {
					continue
				}
				if (coordinateDistanceSquared(unit.coord, this.target.coord) <= collisionRadiusSquared) {
					this.onCollided(elapsedMS, this, unit)
					this.collidedWith.push(unit.instanceID)
				}
			}
		}
		return true
	}
}
