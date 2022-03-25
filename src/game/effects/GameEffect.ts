import { ref } from 'vue'

import type { ChampionSpellData, SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { getters } from '#/game/store'

import { solveSpellCalculationFrom } from '#/helpers/calculate'
import { DamageSourceType } from '#/helpers/types'
import type { BonusLabelKey, BonusVariable, CollisionFn, StatusEffectData, TeamNumber } from '#/helpers/types'

export class GameEffectChild {
	apply: (elapsedMS: number, unit: ChampionUnit) => boolean = () => false
	intersects: (unit: ChampionUnit) => boolean = () => false
	update: (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => boolean | undefined = () => false
	start: () => void = () => {}
}

export interface GameEffectData {
	/** The windup delay before it appears. When passed with a `SpellCalculation`, it is inferred as `castTime`, or `DEFAULT_CAST_SECONDS` as a fallback. Defaults to `0` otherwise. */
	startsAfterMS?: DOMHighResTimeStamp
	/** The delay until it should stop applying. Defaults to `0` (only applying once). */
	expiresAfterMS?: DOMHighResTimeStamp
	/** The team whose units to hit-test. */
	targetTeam?: TeamNumber
	/** `SpellCalculation` to apply to any affected units. */
	damageCalculation?: SpellCalculation
	/** Bonus `SpellCalculation` to apply to any affected units (ignores `damageIncrease`/`damageMultiplier`). */
	bonusCalculations?: SpellCalculation[]
	/** If the `damageMultiplier` and `damageIncrease` should only apply if the spell has hit the target multiple times. */
	modifiesOnMultiHit?: boolean
	/** Adds to the result of `damageCalculation`. */
	damageIncrease?: number
	/** Multiplies the result of `damageCalculation`. */
	damageMultiplier?: number
	/** Bonus crit chance to apply with `damageCalculation`. */
	critBonus?: number
	/** Defaults to `spell` when passed with a `SpellCalculation`. */
	damageSourceType?: DamageSourceType
	/** `BonusVariable`s to apply to any affected units. */
	bonuses?: [BonusLabelKey, ...BonusVariable[]]
	/** `StatusEffects` to apply to any affected units. */
	statusEffects?: StatusEffectData[]
	/** Callback once the effect begins. */
	onActivate?: CollisionFn
	/** Callback for each unit the `GameEffect` applies to. */
	onCollision?: CollisionFn
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
	expiresAtMS: DOMHighResTimeStamp = 0
	source: ChampionUnit
	targetTeam: TeamNumber | null
	damageCalculation: SpellCalculation | undefined
	bonusCalculations: SpellCalculation[]
	modifiesOnMultiHit: boolean
	damageIncrease: number | undefined
	damageMultiplier: number | undefined
	critBonus: number | undefined
	damageSourceType: DamageSourceType
	bonuses: [BonusLabelKey, ...BonusVariable[]] | undefined
	statusEffects: StatusEffectData[] | undefined

	collidedWith: string[] = []

	onActivate: CollisionFn | undefined
	onCollision: CollisionFn | undefined

	constructor(source: ChampionUnit, spell: ChampionSpellData | undefined, data: GameEffectData) {
		super()
		this.instanceID = `e${instanceIndex += 1}`
		this.hitID = spell ? `${source.instanceID}${spell.name}${source.castCount}` : this.instanceID
		this.source = source
		this.targetTeam = data.targetTeam === undefined ? source.opposingTeam() : data.targetTeam
		this.damageCalculation = data.damageCalculation
		this.bonusCalculations = data.bonusCalculations ?? []
		this.modifiesOnMultiHit = data.modifiesOnMultiHit ?? false
		this.damageIncrease = data.damageIncrease
		this.damageMultiplier = data.damageMultiplier
		this.critBonus = data.critBonus
		this.damageSourceType = data.damageSourceType!
		this.bonuses = data.bonuses
		this.statusEffects = data.statusEffects
		this.onActivate = data.onActivate
		this.onCollision = data.onCollision
		if (this.damageCalculation && this.damageSourceType == null) {
			console.warn('damageSourceType', spell != null, data)
		}
	}
	postInit() {
		this.started.value = this.startsAtMS === 0
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

	applyDamage(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		const spellShield = this.damageCalculation ? unit.consumeSpellShield() : undefined
		const wasSpellShielded = !!spellShield
		if (this.damageCalculation != null) {
			const modifiesDamage = !this.modifiesOnMultiHit || unit.hitBy.includes(this.hitID)
			let damageIncrease = 0
			let damageMultiplier: number | undefined
			if (modifiesDamage) {
				damageIncrease = this.damageIncrease ?? 0
				damageMultiplier = this.damageMultiplier
			}
			if (wasSpellShielded) {
				damageIncrease -= spellShield.amount
			}
			unit.damage(elapsedMS, true, this.source, this.damageSourceType!, this.damageCalculation!, true, damageIncrease === 0 ? undefined : damageIncrease, damageMultiplier, this.critBonus)
		}
		return wasSpellShielded
	}

	applySuper(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		if (this.collidedWith.includes(unit.instanceID)) {
			return false
		}
		const isFirstTarget = !this.collidedWith.length
		const wasSpellShielded = this.applyDamage(elapsedMS, unit)

		this.bonusCalculations.forEach(bonusCalculation => {
			unit.damage(elapsedMS, false, this.source, DamageSourceType.bonus, bonusCalculation, true)
		})
		if (!wasSpellShielded) {
			this.applyBonuses(elapsedMS, unit)
			this.onCollision?.(elapsedMS, unit)
		}

		if (isFirstTarget && this.damageCalculation) {
			const [rawDamage, damageType] = solveSpellCalculationFrom(this.source, unit, this.damageCalculation)
			getters.activeAugmentEffectsByTeam.value[this.source.team].forEach(([augment, effects]) => effects.onFirstEffectTargetHit?.(augment, elapsedMS, unit, this.source, damageType))
		}
		this.collidedWith.push(unit.instanceID)
		unit.hitBy.push(this.hitID)
		return true
	}

	checkCollision(elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) {
		const targetingUnits = units.filter(unit => {
			if (this.targetTeam != null && unit.team !== this.targetTeam) {
				return false
			}
			return unit.isInteractable() && this.intersects(unit)
		})
		// console.log(targetingUnits.map(u => u.name)) //SAMPLE
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
			this.onActivate?.(elapsedMS, this.source)
		}
	}
}
