import { defineConfig } from 'vite'

import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
	const vuePlugin = vue()
	const tsconfigPlugin = tsconfigPaths({ loose: true })
	return {
		plugins: mode === 'production'
			? [tsconfigPlugin, vuePlugin]
			: [tsconfigPlugin, checker({ vueTsc: true }), vuePlugin],
		server: {
			open: true,
		},
		test: {
			setupFiles: 'test/setup.ts',
			environment: 'happy-dom',
		},
	}
})
