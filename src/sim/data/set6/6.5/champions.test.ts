import { beforeAll, expect, test } from 'vitest'

import { ChampionKey } from '@tacticians-academy/academy-library'

import { setSetNumber } from '#/store/store'

import { fastForwardUntil } from '#/sim/loop'

import { testSpawnUnits } from '#test/utils'

beforeAll(async () => await setSetNumber(6.5))

test(ChampionKey.JarvanIV, () => {
	const [testUnit, [ally], [enemy]] = testSpawnUnits(ChampionKey.JarvanIV)
	testUnit.castAbility(0, true)
	fastForwardUntil(elapsedMS => testUnit.bonuses.length > 0)
	expect(testUnit.attackSpeed()).toBeGreaterThan(testUnit.data.stats.attackSpeed)
	expect(ally.attackSpeed()).toBeGreaterThan(ally.data.stats.attackSpeed)
	expect(enemy.attackSpeed()).toBe(enemy.data.stats.attackSpeed)
})
