<script setup lang="ts">
import '#/assets/main.postcss'

import Board from '#/components/Board.vue'
import Sidebar from '#/components/Sidebar/Sidebar.vue'

import { state } from '#/game/store'
</script>

<template>
<div v-if="!state.loadedSetNumber" class="h-full  flex">
	<Sidebar />
	<Board />
</div>
</template>
