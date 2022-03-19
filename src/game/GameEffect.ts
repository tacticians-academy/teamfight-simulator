import { reactive, ref } from 'vue'

import type { SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { CollisionFn, DamageSourceType, HexCoord, StatusEffectsData, StatusEffectType, TeamNumber } from '#/helpers/types'

export class GameEffectChild {
	apply: (elapsedMS: number, unit: ChampionUnit) => boolean = () => false
	intersects: (unit: ChampionUnit) => boolean = () => false
	update: (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => boolean | undefined = () => false
	start: () => void = () => {}
}

export interface GameEffectData {
	/** The windup delay before the HexEffect appears. When passed with a `SpellCalculation`, it is inferred as `castTime`, or `DEFAULT_CAST_SECONDS` as a fallback. Defaults to `0` otherwise. */
	startsAfterMS?: DOMHighResTimeStamp
	/** The delay until the HexEffect should stop applying. Defaults to `0` (only applying once). */
	expiresAfterMS?: DOMHighResTimeStamp
	/** The team whose units inside `hexes`/`hexDistanceFromSource` will be hit. */
	targetTeam?: TeamNumber
	/** `StatusEffects` to apply to any affected units. */
	statusEffects?: StatusEffectsData
	/** `SpellCalculation` to apply to any affected units. */
	damageCalculation?: SpellCalculation
	/** Multiplies the result of `damageCalculation`. */
	damageMultiplier?: number
	/** Adds to the result of `damageCalculation`. */
	damageIncrease?: number
	/** Defaults to `spell` when passed with a `SpellCalculation`. */
	damageSourceType?: DamageSourceType
	/** Callback for each unit the HexEffect applies to. */
	onCollision?: CollisionFn
}

let instanceIndex = 0

export class GameEffect extends GameEffectChild {
	instanceID: string
	started = ref(false)
	activated = false
	updatedAtMS: DOMHighResTimeStamp = 0
	startsAtMS: DOMHighResTimeStamp = 0
	activatesAfterMS: DOMHighResTimeStamp = 0
	activatesAtMS: DOMHighResTimeStamp = 0
	expiresAtMS: DOMHighResTimeStamp = 0
	source: ChampionUnit
	targetTeam: TeamNumber | null | undefined
	damageCalculation?: SpellCalculation
	damageIncrease?: number
	damageMultiplier?: number
	damageSourceType?: DamageSourceType
	statusEffects?: StatusEffectsData
	onCollision?: CollisionFn

	constructor(source: ChampionUnit, data: GameEffectData) {
		super()
		this.instanceID = `ge${instanceIndex += 1}`
		this.source = source
		this.targetTeam = data.targetTeam === undefined ? source.opposingTeam() : data.targetTeam
		this.damageCalculation = data.damageCalculation
		this.damageIncrease = data.damageIncrease
		this.damageMultiplier = data.damageMultiplier
		this.damageSourceType = data.damageSourceType
		this.statusEffects = data.statusEffects
		this.onCollision = data.onCollision
	}

	applySuper(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		const spellShield = unit.consumeSpellShield()
		const wasSpellShielded = !!spellShield
		if (this.damageCalculation != null) {
			let damageIncrease = this.damageIncrease ?? 0
			if (wasSpellShielded) {
				damageIncrease -= spellShield.amount
			}
			unit.damage(elapsedMS, true, this.source, this.damageSourceType!, this.damageCalculation!, true, damageIncrease === 0 ? undefined : damageIncrease, this.damageMultiplier)
		}
		if (!wasSpellShielded) {
			this.onCollision?.(elapsedMS, unit)
			if (this.statusEffects) {
				for (const key in this.statusEffects) {
					const statusEffect = this.statusEffects[key as StatusEffectType]!
					unit.applyStatusEffect(elapsedMS, key as StatusEffectType, statusEffect.durationMS, statusEffect.amount)
				}
			}
		}
		return wasSpellShielded
	}

	checkCollision(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const targetingUnits = units.filter(unit => {
			if (this.targetTeam != null && unit.team !== this.targetTeam) {
				return false
			}
			return unit.isInteractable() && this.intersects(unit)
		})
		targetingUnits.forEach(unit => this.apply(elapsedMS, unit))
	}

	updateSuper(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		if (this.activated && elapsedMS > this.expiresAtMS) {
			return false
		}
		if (!this.started.value && elapsedMS >= this.startsAtMS) {
			this.started.value = true
			this.start()
		}
		if (elapsedMS < this.activatesAtMS) {
			return true
		}
		if (!this.activated) {
			this.activated = true
		}
	}
}