<template>
	<aside>
		<div class="sidebar-section">Adolla</div>

		<nav class="sidebar-section">
			<div class="nav-section">
				<Link to="/">Home</Link>
				<Link to="/search">Search</Link>
				<Link to="/settings">Settings</Link>
			</div>
		</nav>
	</aside>
</template>

<style lang="scss" scoped>
aside {
	width: 240px;
	height: 100vh;
	height: 100dvh;
	background: var(--content);
	border-right: 1px solid var(--border);

	.nav-section a + a {
		margin-top: 5px;
	}

	.sidebar-section {
		--offset: 20px;
		padding: 20px;

		+ .sidebar-section {
			border-top: 1px solid var(--border);
		}
	}
}
</style>

<script lang="ts" setup>
import Link from "./Link.vue";
</script>
