<script lang="ts">
  const {
    pageContainer = false,
    children,
  }: {
    pageContainer?: boolean;
    children: any;
  } = $props();
</script>

<div class="relative z-10 px-4 md:px-10 max-w-6xl mx-auto">
  {#if pageContainer}
    <div class="mb-10 pb-[env(safe-area-inset-bottom)]">
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
</div>
