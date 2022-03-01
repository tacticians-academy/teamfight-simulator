import { getDistanceUnit, getRowOfMost } from '#/helpers/abilityUtils'
import { AbilityFn, EffectKey } from '#/helpers/types'
import { BonusKey } from '@tacticians-academy/academy-library'
import { TraitKey, traits } from '@tacticians-academy/academy-library/dist/set6/traits'

export default {
	Caitlyn: (elapsedMS, spell, champion) => {
		const doesTargetNearest = false
		const target = getDistanceUnit(doesTargetNearest, champion)
		if (!target) {
			return console.log('No target', champion.name, champion.team)
		}
		champion.queueProjectile(elapsedMS, {
			spell,
			target,
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: true,
			retargetOnTargetDeath: doesTargetNearest,
		})
	},
	Zyra: (elapsedMS, spell, champion) => {
		champion.queueHexEffect(elapsedMS, {
			spell,
			hexes: getRowOfMost(champion.opposingTeam()),
			stunSeconds: champion.getSpellValue('StunDuration'),
		})
	},
	Ezreal: (elapsedMS, spell, champion) => {
		const doesTargetNearest = true
		const target = getDistanceUnit(doesTargetNearest, champion)
		if (!target) {
			return console.log('No target', champion.name, champion.team)
		}
		champion.queueProjectile(elapsedMS, {
			spell,
			target,
			collidesWith: champion.opposingTeam(),
			destroysOnCollision: false,
			retargetOnTargetDeath: doesTargetNearest,
			damage: champion.attackDamage(),
			onCollision: () => {
				const allASBonuses = champion.getBonusFor(EffectKey.AS)
				if (allASBonuses.length < 5) {
					champion.bonuses.push([EffectKey.AS, [[BonusKey.AttackSpeed, 30]]])
				}
			},
		})
	},
} as Record<string, AbilityFn>
