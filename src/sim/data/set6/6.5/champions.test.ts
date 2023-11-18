import { beforeAll, expect, test } from 'vitest'

import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6.5/champions'

import { setSetNumber } from '#/store/store'

import { fastForwardUntil } from '#/sim/loop'
import type { BonusLabelKey } from '#/sim/helpers/types'

import { testSpawnUnits } from '#test/utils'

beforeAll(async () => await setSetNumber(6.5))

test(ChampionKey.JarvanIV, () => {
	const [testUnit, [ally], [enemy]] = testSpawnUnits(ChampionKey.JarvanIV)
	testUnit.castAbility(0, true)
	fastForwardUntil(elapsedMS => testUnit.getBonusesFrom(testUnit.getCurrentSpell()?.name as BonusLabelKey).length > 0)
	expect(testUnit.attackSpeed()).toBeGreaterThan(testUnit.data.stats.attackSpeed)
	expect(ally.attackSpeed()).toBeGreaterThan(ally.data.stats.attackSpeed)
	expect(enemy.attackSpeed()).toBe(enemy.data.stats.attackSpeed)
})
