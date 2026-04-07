<script lang="ts">
  import { page } from "$app/state";
  import SearchIcon from "../icons/Search.svelte";
  import TextInput from "../util/TextInput.svelte";
  let s = $state(page.data.query || "");
</script>

<TextInput bind:value={s} placeholder="Fire Force" name="q">
  <SearchIcon />
</TextInput>
