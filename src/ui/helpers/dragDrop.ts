import { useStore } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'
import type { CustomComp } from '#/sim/data/types'
import type { HexCoord } from '#/sim/helpers/types'
import { getTeamFor } from '#/sim/helpers/hexes'

const { state, copyItem, moveItem, dropUnit, deleteItem, deleteUnit, setCompForTeam } = useStore()

export type DraggableType = 'unit' | 'item' | 'comp' | 'shop'

export function onDragOver(event: DragEvent) {
	if (!event.dataTransfer || event.dataTransfer.items.length < 2) return

	event.preventDefault()
}

export function getDragName(event: DragEvent) {
	const name = event.dataTransfer?.getData('text/name')
	return name == null || !name.length ? null : name
}
export function getDragType(event: DragEvent): DraggableType | undefined {
	return event.dataTransfer?.getData('text/type') as DraggableType
}

export function getDragNameOf(type: DraggableType, event: DragEvent) {
	const dragType = getDragType(event)
	if (dragType !== type) {
		return null
	}
	return getDragName(event)
}

export function onDropSell(event: DragEvent) {
	const dragUnit = state.dragUnit
	if (!dragUnit) return

	const dragType = getDragType(event)
	if (dragType === 'unit') {
		deleteUnit(dragUnit.startHex ?? dragUnit.benchIndex!)
	} else if (dragType === 'item') {
		const name = getDragName(event)
		if (name != null) {
			deleteItem(name, dragUnit, false)
		}
	}
}

export function onDropOnUnit(event: DragEvent, onUnit: ChampionUnit) {
	const type = getDragType(event)
	const name = getDragName(event)
	if (type == null || name == null) return

	event.preventDefault()
	if (type === 'unit') {
		dropUnit(event, name, onUnit.startHex, onUnit.benchIndex)
	} else if (type === 'item') {
		if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
			copyItem(name, onUnit)
		} else {
			moveItem(name, onUnit, state.dragUnit)
		}
	} else if (type === 'comp') {
		if (onUnit.startHex) {
			onDropComp(name, onUnit.startHex)
		}
	}
}

export function onDropComp(raw: string, hex: HexCoord) {
	const data = JSON.parse(raw) as CustomComp
	const team = getTeamFor(hex)
	setCompForTeam(data, team)
}
