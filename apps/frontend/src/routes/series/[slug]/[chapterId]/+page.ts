import type { ChapterViewDto, MangaDetailsDto } from "$lib/api/manga";
import { api } from "$lib/hooks/fetch";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { slug, chapterId } = params;
  const scrapeResult = await api.useFetch<ChapterViewDto>(
    fetch,
    `/api/v1/manga/${slug}/chapters/${chapterId}`,
  );

  return {
    slug,
    chapterId,
    mangaId: slug,
    chapter: scrapeResult,
    skipRootLayout: true,
  };
};
