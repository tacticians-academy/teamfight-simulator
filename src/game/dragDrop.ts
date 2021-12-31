export function onDragOver(event: DragEvent) {
	if (event.dataTransfer?.items.length !== 2) {
		return
	}
	event.preventDefault()
}

export function getDragNameOf(type: 'unit' | 'item', event: DragEvent) {
	const dragType = event.dataTransfer?.getData('text/type')
	if (dragType !== type) {
		return null
	}
	const championName = event.dataTransfer?.getData('text/name')
	if (championName == null || !championName.length) {
		return null
	}
	return championName
}
