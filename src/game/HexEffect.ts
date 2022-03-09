import type { ChampionSpellData, SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'

import type { CollisionFn, DamageSourceType, HexCoord } from '#/helpers/types'

const DEFAULT_CAST_TIME = 0.25 // TODO confirm default cast time
const DEFAULT_TRAVEL_TIME = 0 // TODO confirm default travel time

export interface HexEffectData {
	spell: ChampionSpellData
	expiresAfterMS?: DOMHighResTimeStamp
	hexes: HexCoord[]
	targetTeam?: number
	damageCalculation?: SpellCalculation
	damageModifier?: number,
	damageSourceType?: DamageSourceType
	stunSeconds?: number
	onCollision?: (unit: ChampionUnit) => void
}

let instanceIndex = 0

export class HexEffect {
	instanceID: string

	startsAtMS: DOMHighResTimeStamp
	activatesAfterMS: DOMHighResTimeStamp
	activatesAtMS: DOMHighResTimeStamp
	expiresAtMS: DOMHighResTimeStamp
	source: ChampionUnit
	targetTeam: number | null
	hexes: HexCoord[]
	damageCalculation?: SpellCalculation
	damageModifier?: number
	damageSourceType?: DamageSourceType
	stunMS: number | null
	onCollision?: CollisionFn

	activated = false

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: HexEffectData) {
		this.instanceID = `h${instanceIndex += 1}`
		this.startsAtMS = elapsedMS + (data.spell.castTime ?? DEFAULT_CAST_TIME) * 1000
		this.activatesAfterMS = data.spell.missile!.travelTime ?? DEFAULT_TRAVEL_TIME * 1000
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		this.source = source
		this.targetTeam = data.targetTeam ?? source.opposingTeam()
		this.hexes = data.hexes
		this.damageCalculation = data.damageCalculation
		this.damageModifier = data.damageModifier
		this.damageSourceType = data.damageSourceType
		this.stunMS = data.stunSeconds != null ? data.stunSeconds * 1000 : null
		this.onCollision = data.onCollision
	}
}
