import type { ChampionSpellData, SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { CollisionFn, DamageSourceType, HexCoord, StatusEffectsData, StatusEffectType, TeamNumber } from '#/helpers/types'
import { getSurroundingWithin } from '#/helpers/boardUtils'

const DEFAULT_CAST_TIME = 0.25 // TODO confirm default cast time
const DEFAULT_TRAVEL_TIME = 0 // TODO confirm default travel time

export interface HexEffectData {
	/** The windup delay before the HexEffect appears. */
	startsAfterMS?: DOMHighResTimeStamp
	/** The delay until the HexEffect should stop applying. Defaults to 0 (only applying once). */
	expiresAfterMS?: DOMHighResTimeStamp
	/** The hexes that any units of the `targetTeam` standing on will be hit. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexes?: HexCoord[]
	/** Distance from the source unit that this HexEffect applies to at the time of activation. Either `hexes` or `hexDistanceFromSource` must be provided. */
	hexDistanceFromSource?: number
	/** The team whose units inside `hexes`/`hexDistanceFromSource` will be hit. */
	targetTeam?: TeamNumber
	/** `StatusEffects` to apply to any affected units. */
	statusEffects?: StatusEffectsData,
	/** `SpellCalculation` to apply to any affected units. */
	damageCalculation?: SpellCalculation
	/** Multiplies the result of `damageCalculation`. */
	damageMultiplier?: number,
	/** Adds to the result of `damageCalculation`. */
	damageIncrease?: number,
	/** Defaults to `spell` when passed with a `SpellCalculation`. */
	damageSourceType?: DamageSourceType
	/** Stuns affected units. */
	stunSeconds?: number
	/** Taunts affected units to the source unit. */
	taunts?: boolean
	/** Callback for each unit the HexEffect applies to. */
	onCollision?: CollisionFn
}

let instanceIndex = 0

export class HexEffect {
	instanceID: string

	startsAtMS: DOMHighResTimeStamp
	activatesAfterMS: DOMHighResTimeStamp
	activatesAtMS: DOMHighResTimeStamp
	expiresAtMS: DOMHighResTimeStamp
	source: ChampionUnit
	targetTeam: TeamNumber | null
	hexes?: HexCoord[]
	hexDistanceFromSource?: number
	statusEffects?: StatusEffectsData
	damageCalculation?: SpellCalculation
	damageMultiplier?: number
	damageIncrease?: number
	damageSourceType?: DamageSourceType
	stunMS: number | null
	taunts: boolean
	onCollision?: CollisionFn

	activated = false

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, data: HexEffectData) {
		this.instanceID = `h${instanceIndex += 1}`
		this.startsAtMS = elapsedMS + (data.startsAfterMS ?? ((spell!.castTime ?? DEFAULT_CAST_TIME) * 1000))
		this.activatesAfterMS = spell ? (spell.missile!.travelTime ?? DEFAULT_TRAVEL_TIME) * 1000 : 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		this.source = source
		this.targetTeam = data.targetTeam === undefined ? source.opposingTeam() : data.targetTeam
		this.hexes = data.hexes
		this.hexDistanceFromSource = data.hexDistanceFromSource
		this.statusEffects = data.statusEffects
		this.damageCalculation = data.damageCalculation
		this.damageMultiplier = data.damageMultiplier
		this.damageIncrease = data.damageIncrease
		this.damageSourceType = data.damageSourceType
		this.stunMS = data.stunSeconds != null ? data.stunSeconds * 1000 : null
		this.taunts = data.taunts ?? false
		this.onCollision = data.onCollision
	}

	start() {
		if (!this.hexes) {
			const sourceHex = this.source.activeHex
			const hexes = getSurroundingWithin(sourceHex, this.hexDistanceFromSource!)
			hexes.push(sourceHex)
			this.hexes = hexes
		}
	}

	apply(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		const spellShield = unit.consumeSpellShield()
		if (this.damageCalculation != null) {
			let damageIncrease = this.damageIncrease ?? 0
			if (spellShield) {
				damageIncrease -= spellShield.amount
			}
			unit.damage(elapsedMS, true, this.source, this.damageSourceType!, this.damageCalculation!, true, damageIncrease === 0 ? undefined : damageIncrease, this.damageMultiplier)
		}
		if (spellShield == null) {
			if (this.stunMS != null) {
				unit.stunnedUntilMS = Math.max(unit.stunnedUntilMS, elapsedMS + this.stunMS)
			}
			this.onCollision?.(elapsedMS, unit)
			if (this.statusEffects) {
				for (const key in this.statusEffects) {
					const statusEffect = this.statusEffects[key as StatusEffectType]!
					unit.applyStatusEffect(elapsedMS, key as StatusEffectType, statusEffect.durationMS, statusEffect.amount)
				}
			}
		}
		if (this.taunts && !this.source.isInteractable()) {
			unit.target = this.source
		}
	}

	update(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		if (this.activated && elapsedMS > this.expiresAtMS) {
			return false
		}
		if (elapsedMS < this.activatesAtMS) {
			return true
		}
		this.activated = true
		const targetingUnits = this.targetTeam == null ? units : units.filter(unit => unit.team === this.targetTeam)
		for (const unit of targetingUnits.filter(unit => unit.isInteractable() && unit.isIn(this.hexes!))) {
			this.apply(elapsedMS, unit)
		}
		return true
	}
}
