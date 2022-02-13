import type { ChampionUnit } from '#/game/ChampionUnit'
import { DamageType } from '#/helpers/types'
import type { ChampionSpellData, HexCoord } from '#/helpers/types'

export interface HexEffectData {
	spell: ChampionSpellData
	expiresAfterMS?: DOMHighResTimeStamp
	hexes: HexCoord[]
	targetTeam?: number
	damage?: number
	damageType?: DamageType
	stunSeconds?: number
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

	activated = false

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: HexEffectData) {
		this.instanceID = `h${instanceIndex += 1}`
		this.startsAtMS = elapsedMS + data.spell.castTime! * 1000
		this.activatesAfterMS = data.spell.missile!.travelTime!
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS == null ? 0 : data.expiresAfterMS)
		this.source = source
		this.targetTeam = data.targetTeam ?? source.opposingTeam()
		this.hexes = data.hexes
		this.damage = data.damage ?? null
		this.damageType = data.damage != null ? data.damageType ?? DamageType.magic : null
		this.stunMS = data.stunSeconds != null ? data.stunSeconds * 1000 : null
	}
}
