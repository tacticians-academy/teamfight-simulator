import { defineConfig } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [
		tsconfigPaths({ loose: true }),
		vue(),
	],
	server: {
		open: true,
	},
	test: {
		setupFiles: 'test/setup.ts',
		environment: 'happy-dom',
	},
	define: {
		__VUE_OPTIONS_API__: false,
	},
})
