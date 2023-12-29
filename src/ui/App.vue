<script setup lang="ts">
import '#/ui/assets/main.postcss'

import HexBoard from '#/ui/components/HexBoard.vue'
import SidebarContainer from '#/ui/components/Sidebar/SidebarContainer.vue'
import SetsFooter from '#/ui/components/SetsFooter.vue'
import RolldownShop from '#/ui/components/RolldownShop.vue'

import { useStore } from '#/store/store'

const { state } = useStore()
</script>

<template>
<div class="h-full  flex">
	<SidebarContainer />
	<div class="relative w-full h-full overflow-y-scroll">
		<HexBoard />
		<SetsFooter v-if="state.simMode === 'teamfight'" />
		<RolldownShop v-else-if="state.simMode === 'rolldown'" />
	</div>
</div>
</template>
