<template>
	<div class="layout">
		<Sidebar />
		<main>
			<slot />
		</main>
	</div>
</template>

<style lang="scss" scoped>
.layout {
	display: grid;
	grid-template-columns: auto 1fr;

	main {
		width: 90%;
		margin: 40px auto;
	}
}
</style>

<script lang="ts" setup>
import Sidebar from "~/components/layout/Sidebar/index.vue";
</script>
