<script lang="ts">
  import { goto } from "$app/navigation";
  import SearchIcon from "../icons/Search.svelte";
  import TextInput from "../util/TextInput.svelte";

  let s = $state("");
</script>

<TextInput bind:value={s} placeholder="Fire Force" name="q">
  <SearchIcon />
</TextInput>
