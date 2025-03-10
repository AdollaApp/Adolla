<script lang="ts">
  const {
    pageContainer = false,
    children,
  }: {
    pageContainer?: boolean;
    children: any;
  } = $props();
</script>

<div class="px-10 max-w-6xl mx-auto">
  {#if pageContainer}
    <div class="mb-10">
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
</div>
