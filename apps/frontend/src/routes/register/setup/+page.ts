import { api } from "$lib/hooks/fetch";
import type { PageLoad } from "./$types";

export type RegistrationDto = {
  id: string;
  usernameSuggestion: string | null;
};

export const load: PageLoad = async ({ url, fetch }) => {
  const token = url.searchParams.get("token");
  const registration = await api.useFetch<RegistrationDto>(fetch, '/api/v1/auth/register', {
    query: {
      token,
    },
  });
  return {
    registration,
    token,
  }
};
