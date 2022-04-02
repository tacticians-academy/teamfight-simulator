import { ref } from 'vue'

import type { ChampionSpellData, SpellCalculation } from '@tacticians-academy/academy-library'

import { getters } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import { GAME_TICK_MS } from '#/sim/loop'

import { DamageSourceType } from '#/sim/helpers/types'
import type { ActivateFn, BonusLabelKey, BonusVariable, CollisionFn, DamageModifier, DamageResult, HexCoord, StatusEffectData, TeamNumber } from '#/sim/helpers/types'

export class GameEffectChild {
	apply: (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, isFinalTarget: boolean) => boolean | undefined = () => { throw 'ERR empty GameEffectChild apply' }
	intersects: (unit: ChampionUnit) => boolean = () => { throw 'ERR empty GameEffectChild intersects' }
	update: (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => boolean | undefined = () => { throw 'ERR empty GameEffectChild update' }
	start: () => void = () => {}
}

export interface GameEffectData {
	/** The windup delay before it appears. When passed with a `SpellCalculation`, it is inferred as `castTime`, or `DEFAULT_CAST_SECONDS` as a fallback. Defaults to `0` otherwise. */
	startsAfterMS?: DOMHighResTimeStamp
	/** The delay until it should stop applying. Defaults to `0` (only applying once). */
	expiresAfterMS?: DOMHighResTimeStamp
	/** The team whose units to hit-test. */
	targetTeam?: TeamNumber | null
	/** `SpellCalculation` to apply to any affected units. */
	damageCalculation?: SpellCalculation
	/** Bonus `SpellCalculation` to apply to the first unit hit (ignores `damageModifier`). */
	bonusCalculations?: SpellCalculation[]
	/** If the `damageModifier` should only apply if the spell has hit the target multiple times. */
	modifiesOnMultiHit?: boolean
	/** Modifies the result of `damageCalculation`. */
	damageModifier?: DamageModifier
	/** Defaults to `spell` when passed with a `SpellCalculation`. */
	damageSourceType?: DamageSourceType
	/** `BonusVariable`s to apply to any affected units. */
	bonuses?: [BonusLabelKey, ...BonusVariable[]]
	/** `StatusEffects` to apply to any affected units. */
	statusEffects?: StatusEffectData[]
	/** Callback once the effect begins. */
	onActivate?: ActivateFn
	/** Callback for each unit the `GameEffect` applies to. */
	onCollision?: CollisionFn
	/** The effect's rendered visual opacity. Defaults to 1. */
	opacity?: number
}

export interface AttackBounce {
	maxHexRangeFromOriginalTarget?: number
	bouncesRemaining: number
	damageCalculation?: SpellCalculation
	damageModifier?: DamageModifier
	startHex?: HexCoord
	hitUnits?: ChampionUnit[]
}

export interface AttackEffectData extends GameEffectData {
	/** Attacks should bounce to new targets. */
	bounce?: AttackBounce
}

let instanceIndex = 0

export class GameEffect extends GameEffectChild {
	instanceID: string
	hitID: string
	started = ref(false)
	activated = false
	updatedAtMS: DOMHighResTimeStamp = 0
	startsAtMS: DOMHighResTimeStamp = 0
	activatesAfterMS: DOMHighResTimeStamp = 0
	activatesAtMS: DOMHighResTimeStamp = 0
	expiresAtMS: DOMHighResTimeStamp | undefined
	source: ChampionUnit
	targetTeam: TeamNumber | null | undefined
	damageCalculation: SpellCalculation | undefined
	bonusCalculations: SpellCalculation[]
	modifiesOnMultiHit: boolean
	damageModifier: DamageModifier | undefined
	damageSourceType: DamageSourceType
	bonuses: [BonusLabelKey, ...BonusVariable[]] | undefined
	statusEffects: StatusEffectData[] | undefined
	opacity: number | undefined

	collidedWith: string[] = []

	onActivate: ActivateFn | undefined
	onCollision: CollisionFn | undefined

	constructor(source: ChampionUnit, spell: ChampionSpellData | undefined, data: GameEffectData) {
		super()
		this.instanceID = `e${instanceIndex += 1}`
		this.hitID = spell ? `${source.instanceID}${spell.name}${source.castCount}` : this.instanceID
		this.source = source
		this.targetTeam = data.targetTeam
		this.damageCalculation = data.damageCalculation
		this.bonusCalculations = data.bonusCalculations ?? []
		this.modifiesOnMultiHit = data.modifiesOnMultiHit ?? false
		this.damageModifier = data.damageModifier
		this.damageSourceType = data.damageSourceType!
		this.bonuses = data.bonuses
		this.statusEffects = data.statusEffects
		this.onActivate = data.onActivate
		this.onCollision = data.onCollision
		this.opacity = data.opacity
		if (this.damageCalculation && this.damageSourceType == null) {
			console.warn('damageSourceType', spell != null, data)
		}
	}

	applyBonuses(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		if (this.bonuses) {
			unit.setBonusesFor(this.bonuses[0], this.bonuses[1])
		}
		if (this.statusEffects) {
			this.statusEffects.forEach(([key, statusEffect]) => {
				unit.applyStatusEffect(elapsedMS, key, statusEffect.durationMS, statusEffect.amount)
			})
		}
	}

	applyDamage(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit): [wasSpellShielded: boolean, damage: DamageResult | undefined] {
		const spellShield = this.damageCalculation && this.damageSourceType === DamageSourceType.spell ? unit.consumeSpellShield() : undefined
		const wasSpellShielded = !!spellShield
		let damage: DamageResult | undefined
		if (this.damageCalculation != null) {
			const modifiesDamage = !this.modifiesOnMultiHit || unit.hitBy.has(this.hitID)
			const damageModifier: DamageModifier = modifiesDamage && this.damageModifier
				? this.damageModifier
				: { increase: 0 }
			if (wasSpellShielded && spellShield.amount != null) {
				damageModifier.increase! -= spellShield.amount
			}
			damage = unit.damage(elapsedMS, true, this.source, this.damageSourceType!, this.damageCalculation!, true, damageModifier)
		}
		return [wasSpellShielded, damage]
	}

	applyPost(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		this.collidedWith.push(unit.instanceID)
		unit.hitBy.add(this.hitID)
		unit.hitBy.add(this.source.instanceID)
	}

	applySuper(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		const isFirstTarget = !this.collidedWith.length
		const [wasSpellShielded, damage] = this.applyDamage(elapsedMS, unit)

		if (isFirstTarget) {
			for (const bonusCalculation of this.bonusCalculations) {
				if (unit.dead) { break }
				unit.takeBonusDamage(elapsedMS, this.source, bonusCalculation, true) //TODO determine isAoE
			}
		}
		if (!wasSpellShielded) {
			this.applyBonuses(elapsedMS, unit)
			this.onCollision?.(elapsedMS, this, unit, damage)
		}

		if (isFirstTarget && damage && this.damageCalculation) {
			getters.activeAugmentEffectsByTeam.value[this.source.team].forEach(([augment, effects]) => effects.onFirstEffectTargetHit?.(augment, elapsedMS, unit, this.source, damage))
		}
		this.applyPost(elapsedMS, unit)
		return wasSpellShielded
	}

	checkCollision(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const targetingUnits = units.filter(unit => {
			if (this.targetTeam != null && (unit.team !== this.targetTeam || this.collidedWith.includes(unit.instanceID))) {
				return false
			}
			return unit.isInteractable() && this.intersects(unit)
		})
		targetingUnits.forEach(unit => {
			this.collidedWith.push(unit.instanceID)
			this.apply(elapsedMS, unit, false)
		})
	}

	updateSuper(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		if (this.activated && this.expiresAtMS != null && elapsedMS > this.expiresAtMS) {
			return elapsedMS < this.expiresAtMS + GAME_TICK_MS * 2
		}
		if (!this.started.value && elapsedMS >= this.startsAtMS) {
			this.start()
			this.started.value = true
		}
		if (elapsedMS < this.activatesAtMS) {
			return true
		}
		if (!this.activated) {
			this.activated = true
			this.onActivate?.(elapsedMS, this.source)
		}
	}
}
