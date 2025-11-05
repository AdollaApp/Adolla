<script lang="ts">
  import { page } from "$app/state";
  import Navbar from "$lib/components/nav/Navbar.svelte";
  import "../app.css";
</script>

{#if page?.data?.skipRootLayout !== true}
  <Navbar />
{/if}

<slot />
