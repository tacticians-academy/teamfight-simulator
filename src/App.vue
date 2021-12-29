<script setup lang="ts">
import '#/assets/main.postcss'

import Board from '#/components/Board.vue'
import Sidebar from '#/components/Sidebar.vue'
</script>

<template>
<div class="h-full  flex">
	<Sidebar class="overflow-y-scroll" />
	<Board class="overflow-y-scroll" />
</div>
</template>
