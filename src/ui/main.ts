import { createApp } from 'vue'

import App from '#/ui/App.vue'

createApp(App)
	.directive('focus', {
		mounted(el) {
			el.focus()
		},
	})
	.mount('#app')
