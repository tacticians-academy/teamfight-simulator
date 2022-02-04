import type { ChampionUnit } from '#/game/ChampionUnit'
import { state } from '#/game/store'

import type { DamageType, HexCoord, TeamNumber } from '#/helpers/types'

let instanceIndex = 0

export class Projectile {
	instanceID: string

	position: HexCoord
	velocity: number
	acceleration: number
	source: ChampionUnit
	target: ChampionUnit
	damage: number
	damageType: DamageType

	constructor(velocity: number, acceleration: number, source: ChampionUnit, target: ChampionUnit, damage: number, damageType: DamageType) {
		this.instanceID = `p${instanceIndex += 1}`
		const [x, y] = source.coordinatePosition() // Destructure to avoid mutating source
		this.position = [x, y]
		this.velocity = velocity
		this.acceleration = acceleration
		this.source = source
		this.target = target
		this.damage = damage
		this.damageType = damageType
		state.projectiles.add(this)
	}

	update(elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[], gameOver: (team: TeamNumber) => void) {
		if (this.target.dead) {
			state.projectiles.delete(this) //TODO retarget (Caitlyn ult)
			return
		}
		const [currentX, currentY] = this.position
		const [targetX, targetY] = this.target.coordinatePosition()
		const differenceX = targetX - currentX
		const differenceY = targetY - currentY
		const speed = 0.00001 * diffMS * this.velocity
		if (Math.abs(differenceX) <= speed && Math.abs(differenceY) <= speed) {
			this.target.damage(elapsedMS, this.damage, this.damageType, this.source, units, gameOver)
			state.projectiles.delete(this)
			return
		}

		if (this.acceleration !== 0) {
			this.velocity *= this.acceleration
		}
		const angle = Math.atan2(differenceY, differenceX)
		this.position[0] += Math.cos(angle) * speed
		this.position[1] += Math.sin(angle) * speed
	}
}
