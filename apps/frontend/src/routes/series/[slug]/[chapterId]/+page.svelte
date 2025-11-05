<script lang="ts">
  const { data } = $props();
</script>

<!-- Images -->
<div>
  {#each data.chapter.content as imageThingyMeBob}
    <img src={imageThingyMeBob.url} alt="" />
  {/each}
</div>
