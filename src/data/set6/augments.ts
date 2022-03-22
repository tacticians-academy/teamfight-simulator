import { BonusKey } from '@tacticians-academy/academy-library'
import type { AugmentData } from '@tacticians-academy/academy-library'
import { AugmentGroupKey } from '@tacticians-academy/academy-library/dist/set6/augments'

import type { ChampionUnit } from '#/game/ChampionUnit'

export interface AugmentFns {
	enemyDeath?: (augment: AugmentData, elapsedMS: DOMHighResTimeStamp, dead: ChampionUnit, source: ChampionUnit) => number
}

export default {

} as {[key in AugmentGroupKey]?: AugmentFns}
