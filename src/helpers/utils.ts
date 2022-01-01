export const TESTING = process.env.NODE_ENV !== 'production'

export function getIconURL(assetPath: string) {
	return `https://raw.communitydragon.org/latest/game/${assetPath.toLowerCase().slice(0, -3)}png`
}

export function removeFirstFromArray<T>(array: T[], findFn: (el: T) => boolean) {
	const index = array.findIndex(findFn)
	if (index > -1) {
		array.splice(index, 1)
	}
}
