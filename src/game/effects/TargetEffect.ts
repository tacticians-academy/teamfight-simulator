import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/effects/GameEffect'
import type { GameEffectData } from '#/game/effects/GameEffect'

import { DEFAULT_CAST_SECONDS, DEFAULT_TRAVEL_SECONDS } from '#/helpers/constants'

export interface TargetEffectData extends GameEffectData {
	tickEveryMS?: DOMHighResTimeStamp
	targets?: ChampionUnit[]
}

export class TargetEffect extends GameEffect {
	targets: Set<ChampionUnit>
	ticksRemaining: number | undefined
	tickEveryMS: DOMHighResTimeStamp | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: TargetEffectData) {
		super(source, spell, data)

		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)))
		this.activatesAfterMS = spell ? (spell.missile?.travelTime ?? DEFAULT_TRAVEL_SECONDS) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		if (data.tickEveryMS != null) {
			const ticks = Math.floor(data.expiresAfterMS! / data.tickEveryMS)
			if (ticks > 0) {
				this.tickEveryMS = data.tickEveryMS
				this.ticksRemaining = ticks
				this.damageMultiplier = 1 / ticks - 1
			}
		}

		this.targets = new Set(data.targets)

		this.postInit()
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => {
		const wasSpellShielded = this.applyDamage(elapsedMS, unit)
		return !wasSpellShielded
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		let applies = false
		if (elapsedMS >= this.activatesAtMS) {
			if (this.ticksRemaining != null) {
				if (this.ticksRemaining > 0) {
					this.ticksRemaining -= 1
					this.activatesAtMS += this.tickEveryMS!
					this.onActivate?.(elapsedMS, this.source)
					applies = true
					if (!this.activated) {
						this.targets.forEach(target => {
							if (target.isInteractable()) {
								this.applyBonuses(elapsedMS, target)
							}
						})
					}
				}
			} else if (!this.activated) {
				this.onActivate?.(elapsedMS, this.source)
				applies = true
			} else {
				return false
			}
			this.activated = true
		}
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult === false) {
			if (this.ticksRemaining != null && this.ticksRemaining > 0) {
				console.log('ERR', 'Expired with ticks remainining', this.source.name, this.ticksRemaining, this.targets)
			}
			return updateResult
		}
		if (!applies) { return true }

		this.targets.forEach(target => {
			if (!target.isInteractable() || !this.apply(elapsedMS, target)) {
				this.targets.delete(target)
			}
		})
		if (!this.targets.size) {
			return false
		}
	}
}
