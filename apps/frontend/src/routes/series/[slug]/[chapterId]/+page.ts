import type { ChapterViewDto, MangaDetailsDto, ProgressItemDto } from "$lib/api/manga";
import { api } from "$lib/hooks/fetch";
import { unwrap } from "$lib/hooks/unwrap";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch, parent }) => {
  const { slug, chapterId } = params;
  // Get images and other chapter details
  const chapterResult = await api.useFetch<ChapterViewDto>(
    fetch,
    `/api/v1/manga/${slug}/chapters/${chapterId}`,
  );

  // Get progress & manga chapter list
  const parentData = await parent()
  const mangaResult = await api.useFetch<MangaDetailsDto>(fetch, `/api/v1/manga/${slug}`);

  let progressItem: ProgressItemDto | null = await
    api.useFetch<ProgressItemDto>(
      fetch,
      `/api/v1/users/${parentData?.user?.id}/progress/${slug}/items/${chapterResult.id}`,
    ).catch(() => { return null })

  return {
    slug,
    chapterId,
    mangaId: slug,
    chapter: chapterResult,
    skipRootLayout: true,
    progressItem,
    manga: mangaResult
  };
};
