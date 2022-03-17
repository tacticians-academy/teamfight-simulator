import type { ChampionSpellData, ChampionSpellMissileData, SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { coordinatePosition } from '#/game/store'

import { getDistanceUnit, getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { DEFAULT_CAST_SECONDS, HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT } from '#/helpers/constants'

import { DamageSourceType } from '#/helpers/types'
import type { CollisionFn, HexCoord, TeamNumber } from '#/helpers/types'

let instanceIndex = 0

const hexRadius = HEX_PROPORTION * 2 * 100

export interface ProjectileData {
	/** Inferred to be `spell` if passing with a `SpellCalculation`. */
	sourceType?: DamageSourceType
	/** The windup delay before the Projectile should start moving towards its target. When passed with a `SpellCalculation`, it is inferred as `castTime`, or `DEFAULT_CAST_SECONDS` as a fallback. Defaults to `0` otherwise. */
	startsAfterMS?: DOMHighResTimeStamp
	/** Inferred as the `Damage` spell calculation if passing with a `SpellCalculation`. */
	damageCalculation?: SpellCalculation
	/** If specified, the Projectile should collide with any unit of the given team(s), instead of traveling directly to the specified target. */
	collidesWith?: TeamNumber | null
	/** Whether the Projectile should complete after the first time it collides with a unit. Requires `collidesWith`. */
	destroysOnCollision?: boolean
	/** Only include if not passed with a `SpellCalculation`. */
	missile?: ChampionSpellMissileData
	/** If targeting a HexCoord, `collidesWith` must be set or the Projectile can never hit. Defaults to the source unit's attack target unit. */
	target?: ChampionUnit | HexCoord
	/** If the Projectile should retarget a new unit upon death of the original target. Only works when `target` is a ChampionUnit. */
	retargetOnTargetDeath?: boolean
	/** Callback upon each unit the Projectile collides with if `collidesWith` is set, or upon hitting its `target` unit otherwise. */
	onCollision?: CollisionFn
}

function isUnit(target: ChampionUnit | HexCoord): target is ChampionUnit {
	return 'name' in target
}

export class Projectile {
	instanceID: string

	startsAtMS: DOMHighResTimeStamp
	position: HexCoord
	missile: ChampionSpellMissileData
	currentSpeed: number
	damageCalculation: SpellCalculation
	source: ChampionUnit
	sourceType: DamageSourceType
	target: ChampionUnit | HexCoord
	targetCoordinates: HexCoord
	collidesWith?: TeamNumber | null
	destroysOnCollision?: boolean
	retargetOnTargetDeath?: boolean
	onCollision?: CollisionFn

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: ProjectileData, spell?: ChampionSpellData) {
		this.instanceID = `p${instanceIndex += 1}`

		const startsAfterMS = data.startsAfterMS != null ? data.startsAfterMS : (spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)
		const startDelay = spell?.missile?.startDelay
		this.startsAtMS = elapsedMS + startsAfterMS + (startDelay != null ? startDelay * 1000 : 0)
		const [x, y] = source.coordinatePosition() // Destructure to avoid mutating source
		this.position = [x, y]
		this.missile = spell?.missile ?? data.missile!
		this.currentSpeed = this.missile.speedInitial! //TODO from .travelTime
		this.damageCalculation = data.damageCalculation!
		this.source = source
		this.sourceType = data.sourceType!
		this.target = data.target!
		this.collidesWith = data.collidesWith
		this.destroysOnCollision = data.destroysOnCollision
		this.retargetOnTargetDeath = data.retargetOnTargetDeath
		this.onCollision = data.onCollision

		this.targetCoordinates = isUnit(this.target) ? this.target.coordinatePosition() : coordinatePosition(this.target)
	}

	apply(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) {
		const spellShield = this.sourceType === DamageSourceType.spell ? unit.consumeSpellShield() : undefined
		const damageIncrease = spellShield ? -spellShield.amount : undefined
		unit.damage(elapsedMS, true, this.source, this.sourceType, this.damageCalculation, false, damageIncrease)
		if (!spellShield) {
			this.onCollision?.(elapsedMS, unit)
		}
	}

	update(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp): boolean {
		if (elapsedMS < this.startsAtMS) {
			return true
		}
		if (elapsedMS - this.startsAtMS > 5 * 1000) {
			return false
		}
		if (isUnit(this.target)) {
			if (this.target.dead) {
				if (this.retargetOnTargetDeath != null) {
					const newTarget = getDistanceUnit(this.retargetOnTargetDeath, this.source)
					if (newTarget) {
						this.target = newTarget
					}
				}
				return false
			}
			this.targetCoordinates = this.target.coordinatePosition()
		}
		const [currentX, currentY] = this.position
		const [targetX, targetY] = this.targetCoordinates
		const differenceX = targetX - currentX
		const differenceY = targetY - currentY
		const speed = diffMS / 1000 * this.currentSpeed * HEX_PROPORTION_PER_LEAGUEUNIT
		if (isUnit(this.target) && Math.abs(differenceX) <= speed && Math.abs(differenceY) <= speed) {
			this.apply(elapsedMS, this.target)
			return false
		}

		if (this.missile.acceleration != null) {
			this.currentSpeed *= this.missile.acceleration * diffMS / 1000
			if (this.missile.acceleration > 0) {
				if (this.missile.speedMax != null && this.currentSpeed > this.missile.speedMax) {
					this.currentSpeed = this.missile.speedMax
				}
			} else {
				if (this.missile.speedMin != null && this.currentSpeed < this.missile.speedMin) {
					this.currentSpeed = this.missile.speedMin
				}
			}
		}
		const angle = Math.atan2(differenceY, differenceX)
		this.position[0] += Math.cos(angle) * speed
		this.position[1] += Math.sin(angle) * speed
		const [projectileX, projectileY] = this.position
		if (this.collidesWith !== undefined) {
			const collisionUnits = getInteractableUnitsOfTeam(this.collidesWith)
			for (const unit of collisionUnits) {
				const [unitX, unitY] = unit.coordinatePosition()
				const xDist = (unitX - projectileX) * 100
				const yDist = (unitY - projectileY) * 100
				if (xDist * xDist + yDist * yDist < hexRadius) {
					this.apply(elapsedMS, unit)
					if (this.destroysOnCollision === true) {
						return false
					}
				}
			}
		}
		return true
	}
}
