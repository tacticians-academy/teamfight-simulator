import type { ChampionUnit } from '#/game/ChampionUnit'
import type { DamageType, HexCoord } from '#/helpers/types'

const DEFAULT_CAST_MS = 500
const DEFAULT_MANA_LOCK_MS = 1000

export interface HexEffectData {
	activatesAfterMS: DOMHighResTimeStamp
	source: ChampionUnit
	targetTeam: number
	hexes: HexCoord[]
	damage?: number
	damageType?: DamageType
	stunSeconds?: number
}

export class HexEffect {
	activatesAtMS: DOMHighResTimeStamp
	source: ChampionUnit
	targetTeam: number | null
	hexes: HexCoord[]
	damage: number | null
	damageType: DamageType | null
	stunMS: number | null

	constructor(elapsedMS: DOMHighResTimeStamp, data: HexEffectData) {
		this.activatesAtMS = data.activatesAfterMS === -1 ? elapsedMS + DEFAULT_CAST_MS : data.activatesAfterMS
		this.source = data.source
		this.targetTeam = data.targetTeam
		this.hexes = data.hexes
		this.damage = data.damage ?? null
		this.damageType = data.damageType ?? null
		this.stunMS = data.stunSeconds != null ? data.stunSeconds * 1000 : null

		data.source.attackStartAtMS = this.activatesAtMS
		data.source.manaLockUntilMS = this.activatesAtMS + DEFAULT_MANA_LOCK_MS
	}
}
