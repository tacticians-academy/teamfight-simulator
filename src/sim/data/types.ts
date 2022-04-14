import type { AugmentData, BonusKey, ChampionSpellData, ItemData, TraitEffectData, TraitKey } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import type { AttackEffectData, GameEffect } from '#/sim/effects/GameEffect'

import type { BonusVariable, DamageResult, EmpoweredAuto, TeamNumber } from '#/sim/helpers/types'

type EffectResults = BonusVariable[] | void

export interface AugmentFns {
	modifyAttacks?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => AttackEffectData
	modifyDamageByHolder?: (augment: AugmentData, target: ChampionUnit, holder: ChampionUnit, damage: DamageResult) => void
	delayed?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, team: TeamNumber, units: ChampionUnit[]) => void
	teamWideTrait?: TraitKey
	startOfFight?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	apply?: (augment: AugmentData, team: TeamNumber, units: ChampionUnit[]) => void
	cast?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	onHealShield?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, amount: number, target: ChampionUnit, source: ChampionUnit) => void
	allyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit | undefined) => void
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit | undefined) => void
	onFirstEffectTargetHit?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit, damage: DamageResult) => void
	hpThreshold?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	damageDealtByHolder?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit, damage: DamageResult) => void
	damageTakenByHolder?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, holder: ChampionUnit, source: ChampionUnit | undefined, damage: DamageResult) => void
}
export type AugmentEffects = {[key in string]?: AugmentFns}

export interface ChampionFns {
	innate?: (spell: ChampionSpellData | undefined, champion: ChampionUnit) => EffectResults
	cast?: (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, champion: ChampionUnit) => GameEffect | boolean
	customAuto?: (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData | undefined, target: ChampionUnit, source: ChampionUnit, empoweredAuto: EmpoweredAuto, windupMS: DOMHighResTimeStamp) => void
	passiveCasts?: boolean
	passive?: (elapsedMS: DOMHighResTimeStamp, spell: ChampionSpellData, target: ChampionUnit, source: ChampionUnit, damage: DamageResult | undefined) => void
}
export type ChampionEffects = {[key in string]?: ChampionFns}

interface ItemFns {
	adjacentHexBuff?: (item: ItemData, unit: ChampionUnit, adjacentUnits: ChampionUnit[]) => void
	apply?: (item: ItemData, unit: ChampionUnit) => void
	disableDefaultVariables?: true | BonusKey[]
	innate?: (item: ItemData, uniqueID: string, unit: ChampionUnit) => EffectResults
	update?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
	damageDealtByHolder?: (item: ItemData, itemID: string, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, holder: ChampionUnit, damage: DamageResult) => void
	modifyDamageByHolder?: (item: ItemData, target: ChampionUnit, holder: ChampionUnit, damage: DamageResult) => void
	basicAttack?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, target: ChampionUnit, holder: ChampionUnit, canReProc: boolean) => void
	damageTaken?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, holder: ChampionUnit, source: ChampionUnit | undefined, damage: DamageResult) => void
	castWithinHexRange?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, caster: ChampionUnit, holder: ChampionUnit) => void
	hpThreshold?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
	deathOfHolder?: (elapsedMS: DOMHighResTimeStamp, item: ItemData, itemID: string, unit: ChampionUnit) => void
}
export type ItemEffects = { [key in string]?: ItemFns }

type TraitEffectFn = (unit: ChampionUnit, activeEffect: TraitEffectData) => EffectResults
interface TraitFns {
	teamEffect?: boolean | number | BonusKey[]
	disableDefaultVariables?: true | BonusKey[]
	shouldKeepSpawn?: (spawnedUnit: ChampionUnit) => boolean
	solo?: TraitEffectFn
	team?: TraitEffectFn
	applyForOthers?: (activeEffect: TraitEffectData, unit: ChampionUnit) => void
	onceForTeam?: (activeEffect: TraitEffectData, teamNumber: TeamNumber, units: ChampionUnit[]) => void
	innate?: TraitEffectFn
	update?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, units: ChampionUnit[]) => EffectResults
	allyDeath?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, traitUnits: ChampionUnit[]) => void
	enemyDeath?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, traitUnits: ChampionUnit[]) => void
	basicAttack?: (activeEffect: TraitEffectData, target: ChampionUnit, source: ChampionUnit, canReProc: boolean) => void
	damageDealtByHolder?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, target: ChampionUnit, source: ChampionUnit, damage: DamageResult) => void
	modifyDamageByHolder?: (activeEffect: TraitEffectData, target: ChampionUnit, source: ChampionUnit, damage: DamageResult) => void
	hpThreshold?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
	cast?: (activeEffect: TraitEffectData, elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => void
}
export type TraitEffects = { [key in string]?: TraitFns }
