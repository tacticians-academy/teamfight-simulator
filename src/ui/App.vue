<script setup lang="ts">
import '#/ui/assets/main.postcss'

import Board from '#/ui/components/Board.vue'
import Sidebar from '#/ui/components/Sidebar/Sidebar.vue'
import FooterVue from '#/ui/components/Footer.vue'
</script>

<template>
<div class="h-full  flex">
	<Sidebar />
	<div class="relative w-full h-full overflow-y-scroll">
		<Board />
		<FooterVue />
	</div>
</div>
</template>
