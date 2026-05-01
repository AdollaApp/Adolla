<script lang="ts">
  import { page } from "$app/state";
  import SearchIcon from "../icons/Search.svelte";
  import TextInput from "../util/TextInput.svelte";
  let s = $state(page.data.query || "");
  const props: {
    mobile?: boolean;
  } = $props();
</script>

<TextInput
  bind:value={s}
  placeholder="Fire Force"
  name="q"
  classes={props.mobile ? "py-2 px-3" : ""}
>
  <SearchIcon />
</TextInput>
