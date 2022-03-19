import { ref } from 'vue'
import type { Ref } from 'vue'

import type { ChampionSpellData, ChampionSpellMissileData } from '@tacticians-academy/academy-library'

import type { ChampionUnit } from '#/game/ChampionUnit'
import { GameEffect } from '#/game/GameEffect'
import type { GameEffectData } from '#/game/GameEffect'
import { coordinatePosition } from '#/game/store'

import { getDistanceUnit, getInteractableUnitsOfTeam } from '#/helpers/abilityUtils'
import { DEFAULT_CAST_SECONDS, HEX_PROPORTION, HEX_PROPORTION_PER_LEAGUEUNIT } from '#/helpers/constants'
import type { DamageSourceType } from '#/helpers/types'
import type { HexCoord, TeamNumber } from '#/helpers/types'

const hexRadius = HEX_PROPORTION * 2 * 100

export interface ProjectileData extends GameEffectData {
	/** Inferred to be `spell` if passing with a `SpellCalculation`. */
	sourceType?: DamageSourceType
	/** Whether the Projectile should complete after the first time it collides with a unit. Requires `targetTeam`. */
	destroysOnCollision?: boolean
	/** Only include if not passed with a `SpellCalculation`. */
	missile?: ChampionSpellMissileData
	/** If targeting a HexCoord, `targetTeam` must be set or the Projectile can never hit. Defaults to the source unit's attack target unit. */
	target?: ChampionUnit | HexCoord
	/** If the Projectile should retarget a new unit upon death of the original target. Only works when `target` is a ChampionUnit. */
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
	destroysOnCollision?: boolean
	retargetOnTargetDeath?: boolean

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
		this.retargetOnTargetDeath = data.retargetOnTargetDeath
		this.targetCoordinates = isUnit(this.target) ? this.target.coordinatePosition() : coordinatePosition(this.target)

		this.postInit()
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
		const [currentX, currentY] = this.position.value
		const [targetX, targetY] = this.targetCoordinates
		const differenceX = targetX - currentX
		const differenceY = targetY - currentY
		const speed = diffMS / 1000 * this.currentSpeed * HEX_PROPORTION_PER_LEAGUEUNIT
		if (isUnit(this.target) && Math.abs(differenceX) <= speed && Math.abs(differenceY) <= speed) {
			this.applySuper(elapsedMS, this.target)
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
		this.position.value[0] += Math.cos(angle) * speed
		this.position.value[1] += Math.sin(angle) * speed
		if (this.targetTeam !== undefined) {
			const [projectileX, projectileY] = this.position.value
			const collisionUnits = getInteractableUnitsOfTeam(this.targetTeam)
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
	}
}
