<script lang="ts">
  import Container from "$lib/components/util/Container.svelte";
  import TextInput from "$lib/components/util/TextInput.svelte";
  import { setAuth } from "$lib/hooks/auth.js";
  import { api } from "$lib/hooks/fetch.js";
  import { useAsync } from "$lib/hooks/useAsync.svelte.js";

	const { data } = $props();
  let username = $state(data.registration.usernameSuggestion ?? '');

  type TokenDto = {
    type: 'auth';
    token: string;
  };

  const accountReq = useAsync({
    async run(payload: { username: string, token: string | null }) {
      if (!payload.token) throw new Error("Registration is no longer valid");
      const result = await api.useFetch<TokenDto>(fetch, '/api/v1/auth/register', {
        method: 'POST',
        body: {
          token: payload.token,
          username: payload.username,
        },
      });
      setAuth(result.token);
    }
  });

  function makeAccount() {
    accountReq.execute({ username, token: data.token });
  }
</script>

<Container>
  <TextInput bind:value={username} />
  {#if accountReq.loading}<p>Loading...</p>{/if}
  {#if accountReq.error}<p>Errored!</p>{/if}
  <button onclick={() => makeAccount()}>Make account</button>
</Container>
