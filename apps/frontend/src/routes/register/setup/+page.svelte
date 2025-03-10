<script lang="ts">
  import Container from "$lib/components/util/Container.svelte";
  import { page } from "$app/state";

  const token = $derived(page.url.searchParams.get("token"));

  export const load: PageLoad = ({ params }) => {};
</script>

<Container>
  <p>Registration token: {token}</p>
</Container>
