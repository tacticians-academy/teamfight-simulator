import App from '#/ui/App.vue'

import { createApp } from 'vue'

createApp(App)
	.directive('focus', {
		mounted(el) {
			el.focus()
		},
	})
	.mount('#app')
