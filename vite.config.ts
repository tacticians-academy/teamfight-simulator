import { defineConfig } from 'vite'

import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
	const plugins = [tsconfigPaths({ loose: true }), vue()]
	if (mode === 'development') {
		plugins.push(checker({ vueTsc: true }))
	}
	return {
		plugins,
		server: {
			open: true,
		},
		test: {
			setupFiles: 'test/setup.ts',
			environment: 'happy-dom',
		},
	}
})
