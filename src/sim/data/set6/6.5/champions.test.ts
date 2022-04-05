import { beforeAll, expect, test } from 'vitest'

import { ChampionKey } from '@tacticians-academy/academy-library'

import { setSetNumber } from '#/store/store'

import { fastForwardUntil } from '#/sim/loop'

import { testSpawnUnits } from '#test/utils'

beforeAll(async () => await setSetNumber(6.5))
