<script lang="ts">
  import SearchIcon from "../icons/Search.svelte";
  import TextInput from "../util/TextInput.svelte";

  let s = $state("");
</script>

<TextInput bind:value={s} placeholder="Fire Force">
  <SearchIcon />
</TextInput>
