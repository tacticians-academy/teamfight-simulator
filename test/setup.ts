import { beforeEach } from 'vitest'

import { initGame } from '#/sim/loop'

beforeEach(() => initGame(performance.now()))
