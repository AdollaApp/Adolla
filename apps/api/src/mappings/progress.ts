import type { MangaMetaDb, ProgressItem } from '@/modules/db/schema';
import type { MangaMetaDbDto } from './meta';
import { mapMangaMetaDb } from './meta';

export type ProgressItemDto = {
  id: string;
  userId: string;
  mangaId: string;
  chapterId: string;
  updatedAt: string;
  currentPage: number;
  totalPages: number;
  mangaMeta: MangaMetaDbDto;
};

export function mapProgressItem(item: ProgressItem, meta: MangaMetaDb): ProgressItemDto {
  return {
    id: item.id,
    userId: item.userId,
    mangaId: item.mangaId,
    chapterId: item.chapterId,
    updatedAt: item.updatedAt.toISOString(),
    currentPage: item.currentPage,
    totalPages: item.totalPages,
    mangaMeta: mapMangaMetaDb(meta),
  };
}
