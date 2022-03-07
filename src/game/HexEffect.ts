import type { ChampionSpellData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'

import { DamageType } from '#/helpers/types'
import type { CollisionFn, HexCoord } from '#/helpers/types'

const DEFAULT_CAST_TIME = 0.25 // TODO confirm default cast time
const DEFAULT_TRAVEL_TIME = 0 // TODO confirm default travel time

export interface HexEffectData {
	spell: ChampionSpellData
	expiresAfterMS?: DOMHighResTimeStamp
	hexes: HexCoord[]
	targetTeam?: number
	damage?: number
	damageType?: DamageType
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
	damage?: number | null
	damageType?: DamageType | null
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
		this.damage = data.damage ?? null
		this.damageType = data.damage != null ? data.damageType ?? DamageType.magic : null
		this.stunMS = data.stunSeconds != null ? data.stunSeconds * 1000 : null
		this.onCollision = data.onCollision
	}
}
