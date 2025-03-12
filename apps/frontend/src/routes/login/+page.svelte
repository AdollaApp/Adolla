<script lang="ts">
  import { env } from "$env/dynamic/public";
  import LargeHeading from "$lib/components/text/LargeHeading.svelte";
  import Container from "$lib/components/util/Container.svelte";

  function makeLink(path: string) {
    return `${env.PUBLIC_EXTERNAL_API_BASEURL}${path}`
  }
</script>

<Container>
  <LargeHeading>Log in</LargeHeading>
  <a href={makeLink('/api/v1/auth/oauth/discord')}>Discord login</a>
</Container>
