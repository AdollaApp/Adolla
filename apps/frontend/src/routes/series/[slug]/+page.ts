import type { MangaDetailsDto } from "$lib/api/manga";
import { api } from "$lib/hooks/fetch";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { slug } = params;
  const scrapeResult = await api.useFetch<MangaDetailsDto>(fetch, `/api/v1/manga/${slug}`);

  return {
      slug,
      manga: scrapeResult,
  };
};
