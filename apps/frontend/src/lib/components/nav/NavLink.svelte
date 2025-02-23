<script lang="ts">
  import type { Component } from "svelte";

  export let href: string;
  export let Icon: Component; // uhhhhh
</script>

<a {href} class="flex items-center gap-2 text-text-light">
  {#if Icon}
    <span class="icon-wrapper">
      <Icon />
    </span>
  {/if}
  <slot />
</a>

<style>
  .icon-wrapper > :global(*) {
    /* Unfortunately, Svelte doesn't just let you pass class */
    @apply w-[18px] h-[18px];
  }
</style>
