import type { ProgressItem } from '@/modules/db/schema';
import type { MangaCacheItemDto } from './cache';
import { mapMangaCacheItem } from './cache';

export type ProgressItemDto = {
  id: string;
  userId: string;
  mangaId: string;
  chapterId: string;
  updatedAt: string;
  currentPage: number;
  totalPages: number;
  manga: MangaCacheItemDto;
};

export function mapProgressItem(item: ProgressItem): ProgressItemDto {
  return {
    id: item.id,
    userId: item.userId,
    mangaId: item.mangaId,
    chapterId: item.chapterId,
    updatedAt: item.updatedAt.toISOString(),
    currentPage: item.currentPage,
    totalPages: item.totalPages,
    manga: mapMangaCacheItem(JSON.parse(item.mangaMeta)),
  };
}
