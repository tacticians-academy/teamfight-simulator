import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { AttackBounce, AttackEffectData } from '#/game/effects/GameEffect'

import { getInteractableUnitsOfTeam, getNextBounceFrom } from '#/helpers/abilityUtils'
import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS } from '#/helpers/constants'

export interface TargetEffectData extends AttackEffectData {
	/** The delay to apply after starting. Inferred from the passed `SpellCalculation` if provided. */
	activatesAfterMS?: DOMHighResTimeStamp
	/** The interval between ticks applied to this target. If omitted, the effect applies once. */
	tickEveryMS?: DOMHighResTimeStamp
	/** Array of affected units. */
	sourceTargets?: [ChampionUnit, ChampionUnit][]
	/** Distance around the source to target. */
	targetsInHexRange?: number
}

export class TargetEffect extends GameEffect {
	sourceTargets: Ref<Set<[ChampionUnit, ChampionUnit]>>
	currentTargets: Set<ChampionUnit>
	ticksRemaining: number | undefined
	tickEveryMS: DOMHighResTimeStamp | undefined
	bounce: AttackBounce | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: TargetEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = data.activatesAfterMS != null ? data.activatesAfterMS : (spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0)
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		if (data.tickEveryMS != null) {
			const ticks = Math.floor(data.expiresAfterMS! / data.tickEveryMS)
			if (ticks > 0) {
				this.tickEveryMS = data.tickEveryMS
				this.ticksRemaining = ticks
				if (!this.damageModifier) {
					this.damageModifier = {}
				}
				this.damageModifier.multiplier = (this.damageModifier.multiplier ?? 0) + 1 / ticks - 1
			}
		}

		if (data.targetsInHexRange != null) {
			const targets = getInteractableUnitsOfTeam(data.targetTeam!).filter(unit => unit.hexDistanceTo(source) <= data.targetsInHexRange!)
			this.currentTargets = new Set(targets)
			this.sourceTargets = ref(new Set(targets.map(unit => [source, unit] as [ChampionUnit, ChampionUnit])))
		} else {
			this.currentTargets = new Set(data.sourceTargets!.map(sourceTarget => sourceTarget[1]))
			this.sourceTargets = ref(new Set(data.sourceTargets))
		}
		this.bounce = data.bounce
		if (this.bounce) {
			this.bounce.hitUnits = Array.from(this.currentTargets)
		}

		this.postInit()
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFirstApply: boolean) => {
		const [wasSpellShielded, damage] = this.applyDamage(elapsedMS, unit)
		if (!wasSpellShielded && isFirstApply) {
			this.applyBonuses(elapsedMS, unit)
			this.applyPost(elapsedMS, unit)
			this.onCollision?.(elapsedMS, this, unit, damage)
		}
		return !wasSpellShielded
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		let applies = false
		let isFirst = false
		if (elapsedMS >= this.activatesAtMS) {
			if (this.ticksRemaining != null) {
				if (this.ticksRemaining > 0) {
					this.ticksRemaining -= 1
					this.activatesAtMS += this.tickEveryMS!
					this.onActivate?.(elapsedMS, this.source)
					applies = true
					isFirst = this.activated === false
					this.activated = true
				}
			} else if (!this.activated) {
				isFirst = true
				applies = true
			} else {
				return false
			}
		}
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult === false) {
			return false
		}
		if (applies) {
			this.currentTargets.forEach(target => {
				if (target.isInteractable()) {
					if (!this.apply(elapsedMS, target, isFirst)) {
						this.currentTargets.delete(target)
					}
				}
			})
		}
		if (this.activated) {
			if (this.bounce && this.bounce.bouncesRemaining > 0) {
				const newTargets = new Set<ChampionUnit>()
				this.currentTargets.forEach(target => {
					const bounceTarget = getNextBounceFrom(target, this.bounce!)
					if (bounceTarget) {
						if (this.damageModifier) {
							Object.assign(this.damageModifier, this.bounce!.damageModifier)
						} else {
							this.damageModifier = this.bounce?.damageModifier
						}
						if (this.apply(elapsedMS, bounceTarget, isFirst)) {
							newTargets.add(bounceTarget)
							this.sourceTargets.value.add([target, bounceTarget])
						}
					}
				})
				this.bounce.bouncesRemaining -= 1
				this.currentTargets = newTargets
			}
		} else if (applies) {
			this.activated = true
		}
		return true
	}
}
