<script>
  import Container from "$lib/components/util/Container.svelte";
  import { page } from "$app/state";

  const query = $derived(page.url.searchParams.get("code"));
</script>

<Container>
  <p>Grant code: {query}</p>
</Container>
