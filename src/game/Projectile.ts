import type { ChampionUnit } from '#/game/ChampionUnit'
import { getDistanceUnit, getAttackableUnitsOfTeam } from '#/helpers/abilityUtils'
import { HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT } from '#/helpers/constants'

import type { ChampionSpellData, ChampionSpellMissileData, DamageType, HexCoord, TeamNumber } from '#/helpers/types'

let instanceIndex = 0

const hexRadius = HEX_PROPORTION * 2 * 100

export interface ProjectileData {
	spell?: ChampionSpellData
	startsAfterMS?: DOMHighResTimeStamp
	damage?: number
	damageType?: DamageType
	collidesWith?: TeamNumber | null
	destroysOnCollision?: boolean
	missile?: ChampionSpellMissileData
	target: ChampionUnit
	retargetOnTargetDeath?: boolean
}

export class Projectile {
	instanceID: string

	startsAtMS: DOMHighResTimeStamp
	position: HexCoord
	missile: ChampionSpellMissileData
	currentSpeed: number
	damage: number
	damageType: DamageType
	source: ChampionUnit
	target: ChampionUnit
	collidesWith?: TeamNumber | null
	destroysOnCollision?: boolean
	retargetOnTargetDeath?: boolean

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: ProjectileData) {
		this.instanceID = `p${instanceIndex += 1}`

		const startsAfterMS = data.startsAfterMS != null ? data.startsAfterMS : data.spell!.castTime! * 1000
		const startDelay = data.spell?.missile?.startDelay
		this.startsAtMS = elapsedMS + startsAfterMS + (startDelay != null ? startDelay * 1000 : 0)
		const [x, y] = source.coordinatePosition() // Destructure to avoid mutating source
		this.position = [x, y]
		this.missile = data.spell?.missile ?? data.missile!
		this.currentSpeed = this.missile.speedInitial!
		this.damage = data.damage!
		this.damageType = data.damageType!
		this.source = source
		this.target = data.target
		this.collidesWith = data.collidesWith
		this.destroysOnCollision = data.destroysOnCollision
		this.retargetOnTargetDeath = data.retargetOnTargetDeath
	}

	applyDamage(elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit, units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		unit.damage(elapsedMS, this.damage, this.damageType, this.source, units, gameOver)
	}

	update(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[], gameOver: (team: TeamNumber) => void): boolean {
		if (this.target.dead) {
			if (this.retargetOnTargetDeath != null) {
				const newTarget = getDistanceUnit(this.retargetOnTargetDeath, this.source)
				if (newTarget) {
					this.target = newTarget
				}
			}
			return false
		}
		if (elapsedMS < this.startsAtMS) {
			return true
		}
		const [currentX, currentY] = this.position
		const [targetX, targetY] = this.target.coordinatePosition()
		const differenceX = targetX - currentX
		const differenceY = targetY - currentY
		const speed = diffMS / 1000 * this.currentSpeed * HEX_PROPORTION_PER_LEAGUEUNIT
		if (Math.abs(differenceX) <= speed && Math.abs(differenceY) <= speed) {
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
			const collisionUnits = getAttackableUnitsOfTeam(this.collidesWith)
			for (const unit of collisionUnits) {
				const [unitX, unitY] = unit.coordinatePosition()
				const xDist = (unitX - projectileX) * 100
				const yDist = (unitY - projectileY) * 100
				if (xDist * xDist + yDist * yDist < hexRadius) {
					this.applyDamage(elapsedMS, this.target, units, gameOver)
					if (this.destroysOnCollision === true) {
						return false
					}
				}
			}
		}
		return true
	}
}
