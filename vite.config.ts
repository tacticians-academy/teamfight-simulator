import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ // https://vitejs.dev/config/
	plugins: [vue()],
	resolve: {
		alias: {
			'#/': path.join(path.resolve(), 'src', path.sep),
		},
	},
})
