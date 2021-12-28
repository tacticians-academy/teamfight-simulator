module.exports = {
	content: [
		'./src/**/*.{html,ts,vue}',
	],
	plugins: [
		require('@tailwindcss/forms'),
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
		},
	},
}
