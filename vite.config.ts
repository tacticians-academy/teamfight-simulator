import { defineConfig } from 'vite'

import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ // https://vitejs.dev/config/
	plugins: [
		tsconfigPaths({ loose: true }),
		checker({ vueTsc: true }),
		vue(),
	],
	server: {
		open: true,
	},
})
