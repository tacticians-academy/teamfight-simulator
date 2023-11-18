import { ChampionKey } from '@tacticians-academy/academy-library/dist/set6/champions'

import { resetUnitsAfterUpdating, state } from '#/store/store'

import { ChampionUnit } from '#/sim/ChampionUnit'

export function testSpawnUnits(primary: string, allies: string[] = [ChampionKey.TrainingDummy], enemies: string[] = [ChampionKey.TrainingDummy]): [ChampionUnit, ChampionUnit[], ChampionUnit[]] {
	const primaryUnit = new ChampionUnit(primary, [0, 0], 1)
	const allyUnits = allies.map((ally, index) => new ChampionUnit(ally, [index + 1, 0], 1))
	const enemyUnits = enemies.map((enemy, index) => {
		const unit = new ChampionUnit(enemy, [index, 1], 1)
		unit.team = 1
		return unit
	})
	state.units.push(primaryUnit, ...allyUnits, ...enemyUnits)
	resetUnitsAfterUpdating()
	return [primaryUnit, allyUnits, enemyUnits]
}
