import type { MangaSearchResultDto } from "$lib/api/manga";
import { api } from "./fetch";

export async function getSearchResults(
  query: string,
  scraper: string,
): Promise<MangaSearchResultDto[]> {
  console.log(query);

  return await api.useFetch<MangaSearchResultDto[]>(fetch, "/api/v1/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      scraperId: scraper,
    }),
  });
}
