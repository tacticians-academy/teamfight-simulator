<script setup lang="ts">
import '#/assets/main.postcss'

import Board from '#/components/Board.vue'
import Sidebar from '#/components/Sidebar/Sidebar.vue'
</script>

<template>
<div class="h-full  flex">
	<Sidebar />
	<Board />
</div>
</template>
