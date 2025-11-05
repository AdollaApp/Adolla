<script lang="ts">
  const { data } = $props();
</script>

<pre>
  {JSON.stringify(data, null, "\t")}
</pre>

<!-- Images -->
<div>
  {#each data.chapter.content as imageThingyMeBob}
    <img src={imageThingyMeBob.url} alt="" />
  {/each}
</div>
