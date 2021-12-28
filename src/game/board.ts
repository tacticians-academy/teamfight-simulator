import { reactive, readonly } from 'vue'

import { TESTING } from '#/helpers/utils'

const BOARD_ROW_PER_SIDE_COUNT = 4
const BOARD_ROW_COUNT = BOARD_ROW_PER_SIDE_COUNT * 2
const BOARD_COL_COUNT = 7

const hexRowsCols = [...Array(BOARD_ROW_COUNT)].map(row => [...Array(BOARD_COL_COUNT)].map(col => Object()))

export const state = reactive({
	hexRowsCols,
})

const store = {
	state: TESTING ? readonly(state) : state,
}

export function useStore() {
	return store
}
