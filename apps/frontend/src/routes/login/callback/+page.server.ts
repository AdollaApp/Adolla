import { setAuthForServer } from "$lib/hooks/auth";
import { api } from "$lib/hooks/fetch";
import type { PageServerLoad } from "./$types";

type TokenDto = {
  type: 'auth';
  token: string;
};

export const load: PageServerLoad = async (event) => {
  const { url, fetch } = event;
  const code = url.searchParams.get("code");
  const result = await api.useFetch<TokenDto>(fetch, '/api/v1/auth/login/code', {
    method: 'POST',
    body: {
      code,
    },
  });

  setAuthForServer(event, result.token);

  return {};
};
