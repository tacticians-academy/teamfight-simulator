import { BonusKey } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'

import type { ChampionUnit } from '#/game/ChampionUnit'

export interface AugmentFns {
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit) => number
}

export default {

	[AugmentGroupKey.ThrillOfTheHunt]: {
		enemyDeath: (augment, elapsedMS, dead, source) => {
			const heal = augment.effects['MissingHPHeal']
			if (heal == null) {
				return console.log('ERR', augment.name, augment.effects)
			}
			source.gainHealth(elapsedMS, source, heal, true)
		},
	},

} as {[key in AugmentGroupKey]?: AugmentFns}
