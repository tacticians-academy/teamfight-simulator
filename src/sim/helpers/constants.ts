export const BOARD_MAX_ROW_COUNT = 8
export const BOARD_COL_COUNT = 7

export const DEFAULT_MANA_LOCK_MS = 1000

export const DEFAULT_CAST_SECONDS = 0.25 //TODO confirm default cast time
export const DEFAULT_TRAVEL_SECONDS = 0.25 //TODO confirm default travel time

export const SAFE_HEX_PROPORTION_PER_UPDATE = 0.2 // The maximum hex proportion distance to move before re-checking collision (prevents ghosting)

export const HEX_PROPORTION = 1 / (BOARD_COL_COUNT + 0.5)
export const HEX_MOVE_LEAGUEUNITS = 180
export const HEX_PROPORTION_PER_LEAGUEUNIT = HEX_PROPORTION / HEX_MOVE_LEAGUEUNITS
export const MOVE_LOCKOUT_JUMPERS_MS = 600 // up to date?
export const MOVE_LOCKOUT_MELEE_MS = 1000 //TODO experimentally determine

export const MAX_HEX_COUNT = 11

const UNIT_SIZE_HEX_PROPORTION = 0.75
export const UNIT_SIZE_PROPORTION = HEX_PROPORTION * UNIT_SIZE_HEX_PROPORTION
