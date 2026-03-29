<script lang="ts">
  const {
    pageContainer = false,
    children,
  }: {
    pageContainer?: boolean;
    children: any;
  } = $props();
</script>

<div class="px-4 md:px-10 max-w-6xl mx-auto">
  {#if pageContainer}
    <div
      class="mb-10 pb-[clamp(4rem,calc(env(safe-area-inset-bottom)*2.5),calc(env(safe-area-inset-bottom)*2.5))]"
    >
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
</div>
