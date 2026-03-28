import type { ProgressItemDto } from "$lib/api/manga";
import type { UserDto } from "$lib/api/user";
import { api } from "$lib/hooks/fetch";
import { unwrap } from "$lib/hooks/unwrap";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
  const { data: user } = await unwrap(
    api.useFetch<UserDto>(fetch, "/api/v1/users/@me"),
  );
  const { data: progressItems } = await unwrap(
    api.useFetch<ProgressItemDto[]>(
      fetch,
      `/api/v1/users/${user?.id}/progress`,
    ),
  );

  // Find unique progress items
  // TODO move this to the SQL part of it, don't do it in JS
  const sortedProgressItems = (progressItems || [])?.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  const unqiueProgressItems: ProgressItemDto[] = [];
  const progressItemMangaIds: string[] = [];
  for (const progressItem of sortedProgressItems) {
    if (!progressItemMangaIds.includes(progressItem.mangaId)) {
      progressItemMangaIds.push(progressItem.mangaId);
      unqiueProgressItems.push(progressItem);
    }
  }

  return {
    user,
    progressItems: unqiueProgressItems,
  };
};
