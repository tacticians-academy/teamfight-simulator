import type { ChampionSpellData, ChampionSpellMissileData, SpellCalculation } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'

import { getDistanceUnit, getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT } from '#/helpers/constants'
import type { CollisionFn, DamageSourceType, HexCoord, TeamNumber } from '#/helpers/types'
import { coordinatePosition } from '#/game/store'

let instanceIndex = 0

const hexRadius = HEX_PROPORTION * 2 * 100

export interface ProjectileData {
	spell?: ChampionSpellData
	sourceType?: DamageSourceType
	startsAfterMS?: DOMHighResTimeStamp
	damageCalculation?: SpellCalculation
	collidesWith?: TeamNumber | null
	destroysOnCollision?: boolean
	missile?: ChampionSpellMissileData
	target: ChampionUnit | HexCoord
	retargetOnTargetDeath?: boolean
	onCollision?: CollisionFn
}

function isUnit(arg: ChampionUnit | HexCoord): arg is ChampionUnit {
	return 'name' in arg
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

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: ProjectileData) {
		this.instanceID = `p${instanceIndex += 1}`

		const startsAfterMS = data.startsAfterMS != null ? data.startsAfterMS : data.spell!.castTime! * 1000
		const startDelay = data.spell?.missile?.startDelay
		this.startsAtMS = elapsedMS + startsAfterMS + (startDelay != null ? startDelay * 1000 : 0)
		const [x, y] = source.coordinatePosition() // Destructure to avoid mutating source
		this.position = [x, y]
		this.missile = data.spell?.missile ?? data.missile!
		this.currentSpeed = this.missile.speedInitial! //TODO .travelTime
		this.damageCalculation = data.damageCalculation!
		this.source = source
		this.sourceType = data.sourceType!
		this.target = data.target
		this.collidesWith = data.collidesWith
		this.destroysOnCollision = data.destroysOnCollision
		this.retargetOnTargetDeath = data.retargetOnTargetDeath
		this.onCollision = data.onCollision

		this.targetCoordinates = isUnit(this.target) ? this.target.coordinatePosition() : coordinatePosition(this.target)
	}

	applyDamage(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		this.onCollision?.(unit)
		unit.damage(elapsedMS, true, this.source, this.sourceType, this.damageCalculation, undefined, false, units, gameOver)
	}

	update(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[], gameOver: (team: TeamNumber) => void): boolean {
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
			this.applyDamage(elapsedMS, this.target, units, gameOver)
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
					this.applyDamage(elapsedMS, unit, units, gameOver)
					if (this.destroysOnCollision === true) {
						return false
					}
				}
			}
		}
		return true
	}
}
