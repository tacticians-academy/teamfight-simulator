import { beforeAll, expect, test } from 'vitest'

import { ChampionKey } from '@tacticians-academy/academy-library'

import { setSetNumber } from '#/store/store'

import { fastForwardUntil, GAME_TICK_MS } from '#/sim/loop'

import { testSpawnUnits } from '#test/utils'

beforeAll(async () => await setSetNumber(6.5))

test(ChampionKey.Ziggs, () => {
	const [testUnit, [ally], [enemy]] = testSpawnUnits(ChampionKey.Ziggs)
	testUnit.target = enemy
	const spell = testUnit.castAbility(0, true)
	const travelTime = spell!.missile!.travelTime!
	const completedMS = (travelTime + spell!.castTime!) * 1000
	fastForwardUntil(elapsedMS => elapsedMS >= completedMS - GAME_TICK_MS)
	expect(enemy.health).toBe(enemy.healthMax)
	fastForwardUntil(elapsedMS => elapsedMS >= completedMS)
	expect(ally.health).toBe(ally.healthMax)
	expect(enemy.health).toBeLessThan(enemy.healthMax)
})
