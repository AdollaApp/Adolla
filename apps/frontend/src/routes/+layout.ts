import type { UserDto } from "$lib/api/user";
import { getAuthForServer } from "$lib/hooks/auth";
import { api } from "$lib/hooks/fetch";
import { unwrap } from "$lib/hooks/unwrap";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
  const { data: user } = await unwrap(api.useFetch<UserDto>(fetch, '/api/v1/users/@me'));
  return {
    user,
  }
};

