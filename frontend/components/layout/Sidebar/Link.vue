<template>
	<nuxt-link :to="to">
		<div class="inner">
			<slot />
		</div>
	</nuxt-link>
</template>

<style lang="scss" scoped>
a {
	display: block;
	width: 100%;
	color: inherit;
	text-decoration: none;
	position: relative;
	z-index: 0;

	.inner {
		padding: 10px 16px;
		border-radius: 2px;
		border-radius: 4px;
	}

	&.router-link-exact-active {
		&::before {
			position: absolute;
			left: calc(var(--offset) * -1);
			top: 50%;
			transform: translateY(-50%);
			content: "";
			display: block;
			height: 60%;
			width: 2px;
			background: var(--theme);
		}
		.inner {
			background: var(--content-hover);
		}
	}
}
</style>

<script lang="ts" setup>
defineProps({
	to: {
		type: String,
		required: true,
	},
});
</script>
