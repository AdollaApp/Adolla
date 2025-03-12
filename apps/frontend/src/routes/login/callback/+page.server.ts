import type { TokenDto } from "$lib/api/token";
import { setAuthForServer } from "$lib/hooks/auth";
import { api } from "$lib/hooks/fetch";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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
  redirect(307, "/");
};
