import type { MangaDetailsDto, ProgressItemDto } from "$lib/api/manga";
import { api } from "$lib/hooks/fetch";
import { unwrap } from "$lib/hooks/unwrap";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
  const parentData = await parent()
  const { slug } = params;
  const scrapeResult = await api.useFetch<MangaDetailsDto>(fetch, `/api/v1/manga/${slug}`);

  const { data: progressItems } = await unwrap(
    api.useFetch<ProgressItemDto[]>(
      fetch,
      `/api/v1/users/${parentData?.user?.id}/progress/${scrapeResult.scraper.id}:${scrapeResult.id}`,
    ),
  );

  return {
    slug,
    manga: scrapeResult,
    progressItems,
  };
};
