import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ChampionSpellData, ChampionSpellMissileData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/GameEffect'
import type { GameEffectData } from '#/game/GameEffect'
import { coordinatePosition } from '#/game/store'

import { getDistanceUnit, getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { DEFAULT_CAST_SECONDS, HEX_PROPORTION_PER_LEAGUEUNIT, UNIT_SIZE_PROPORTION } from '#/helpers/constants'
import type { DamageSourceType } from '#/helpers/types'
import type { HexCoord} from '#/helpers/types'
import { coordinateDistanceSquared } from '#/helpers/boardUtils'

export interface ProjectileData extends GameEffectData {
	/** Inferred to be `spell` if passing with a `SpellCalculation`. */
	sourceType?: DamageSourceType
	/** Whether the `Projectile` should complete after the first time it collides with a unit. Set to false to apply to all intermediary units collided with. */
	destroysOnCollision?: boolean
	/** Whether the `Projectile` should continue past its target. Requires `target` to be a hex. */
	continuesPastTarget?: boolean
	/** Only include if not passed with a `SpellCalculation`. */
	missile?: ChampionSpellMissileData
	/** Defaults to the source unit's attack target unit, or the unit's hex at cast time if `continuesPastTarget` is `true`. */
	target?: ChampionUnit | HexCoord
	/** If the `Projectile` should retarget a new unit upon death of the original target. Only works when `target` is a ChampionUnit. */
	retargetOnTargetDeath?: boolean
}

function isUnit(target: ChampionUnit | HexCoord): target is ChampionUnit {
	return 'name' in target
}

export class ProjectileEffect extends GameEffect {
	position: Ref<HexCoord>
	missile: ChampionSpellMissileData
	currentSpeed: number
	sourceType: DamageSourceType
	target: ChampionUnit | HexCoord
	targetCoordinates: HexCoord
	destroysOnCollision: boolean | undefined
	continuesPastTarget: boolean
	retargetOnTargetDeath: boolean | undefined
	width: number

	collidedWith: string[] = []
	collisionRadiusSquared: number

	fixedDeltaX: number | undefined
	fixedDeltaY: number | undefined

	constructor(source: ChampionUnit, elapsedMS: DOMHighResTimeStamp, data: ProjectileData, spell?: ChampionSpellData) {
		super(source, data)

		const startsAfterMS = data.startsAfterMS != null ? data.startsAfterMS : (spell ? (spell.castTime ?? DEFAULT_CAST_SECONDS) * 1000 : 0)
		const startDelay = spell?.missile?.startDelay
		this.startsAtMS = elapsedMS + startsAfterMS + (startDelay != null ? startDelay * 1000 : 0)
		this.activatesAfterMS = 0
		this.activatesAtMS = this.startsAtMS + this.activatesAfterMS
		const expiresAfterMS = 50 * 1000
		this.expiresAtMS = this.activatesAtMS + (data.expiresAfterMS != null ? data.expiresAfterMS : expiresAfterMS)

		this.position = ref([...source.coordinatePosition()] as HexCoord) // Destructure to avoid mutating source
		this.missile = spell?.missile ?? data.missile!
		this.currentSpeed = this.missile.speedInitial! //TODO from .travelTime
		this.sourceType = data.sourceType!
		this.target = data.target!
		this.destroysOnCollision = data.destroysOnCollision
		this.continuesPastTarget = data.continuesPastTarget ?? false
		this.retargetOnTargetDeath = data.retargetOnTargetDeath
		this.targetCoordinates = isUnit(this.target) ? this.target.coordinatePosition() : coordinatePosition(this.target)
		this.width = (this.missile.width ?? 10) * 2 * HEX_PROPORTION_PER_LEAGUEUNIT
		const collisionRadius = (this.width + UNIT_SIZE_PROPORTION) / 2
		this.collisionRadiusSquared = collisionRadius * collisionRadius

		if (this.continuesPastTarget) {
			const [deltaX, deltaY] = this.getDelta()
			this.fixedDeltaX = deltaX
			this.fixedDeltaY = deltaY
		}

		this.postInit()
	}

	getDistanceFor(diffMS: DOMHighResTimeStamp) {
		return diffMS / 1000 * this.currentSpeed * HEX_PROPORTION_PER_LEAGUEUNIT
	}
	getDelta() {
		const [currentX, currentY] = this.position.value
		const [targetX, targetY] = this.targetCoordinates
		const distanceX = targetX - currentX
		const distanceY = targetY - currentY
		const angle = Math.atan2(distanceY, distanceX)
		return [Math.cos(angle), Math.sin(angle), distanceX, distanceY]
	}

	apply = (elapsedMS: DOMHighResTimeStamp, unit: ChampionUnit) => {
		const wasSpellShielded = this.applySuper(elapsedMS, unit)
		return wasSpellShielded
	}

	update = (elapsedMS: DOMHighResTimeStamp, diffMS: DOMHighResTimeStamp, units: ChampionUnit[]) => {
		const updateResult = this.updateSuper(elapsedMS, diffMS, units)
		if (updateResult != null) { return updateResult }

		if (isUnit(this.target)) {
			if (this.target.dead) {
				if (this.retargetOnTargetDeath == null) {
					return false
				}
				const newTarget = getDistanceUnit(this.retargetOnTargetDeath, this.source)
				if (newTarget) {
					this.target = newTarget
				}
			}
			this.targetCoordinates = this.target.coordinatePosition()
		}
		const diffDistance = this.getDistanceFor(diffMS)
		let angleX: number, angleY: number
		if (this.continuesPastTarget) {
			angleX = this.fixedDeltaX!
			angleY = this.fixedDeltaY!
		} else {
			const [deltaX, deltaY, distanceX, distanceY] = this.getDelta()
			angleX = deltaX
			angleY = deltaY
			if (isUnit(this.target) && Math.abs(distanceX) <= diffDistance && Math.abs(distanceY) <= diffDistance) {
				this.applySuper(elapsedMS, this.target)
				return false
			}
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
		const position = this.position.value
		position[0] += angleX * diffDistance
		position[1] += angleY * diffDistance

		if (this.destroysOnCollision != null) {
			for (const unit of getInteractableUnitsOfTeam(this.targetTeam)) {
				if (!this.destroysOnCollision && this.collidedWith.includes(unit.instanceID)) {
					continue
				}
				if (coordinateDistanceSquared(position, unit.coordinatePosition()) < this.collisionRadiusSquared) {
					this.collidedWith.push(unit.instanceID)
					this.apply(elapsedMS, unit)
					if (this.destroysOnCollision) {
						return false
					}
				}
			}
		}
	}
}
