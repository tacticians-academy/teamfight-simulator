import { useStore } from '#/store/store'

import type { ChampionUnit } from '#/sim/ChampionUnit'

const { state, copyItem, moveItem, dropUnit } = useStore()

export type DraggableType = 'unit' | 'item'

export function onDragOver(event: DragEvent) {
	if (!event.dataTransfer || event.dataTransfer.items.length < 2) {
		return
	}
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

export function onDropOnUnit(event: DragEvent, onUnit: ChampionUnit) {
	const type = getDragType(event)
	const name = getDragName(event)
	if (type == null || name == null) {
		return
	}
	event.preventDefault()
	if (type === 'item') {
		if (state.dragUnit && event.dataTransfer?.effectAllowed === 'copy') {
			copyItem(name, onUnit)
		} else {
			moveItem(name, onUnit, state.dragUnit)
		}
	} else {
		dropUnit(event, name, onUnit.startHex)
	}
}
