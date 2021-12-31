export const TESTING = process.env.NODE_ENV !== 'production'

export function getIconURL(assetPath: string) {
	return `https://raw.communitydragon.org/latest/game/${assetPath.toLowerCase().slice(0, -3)}png`
}
