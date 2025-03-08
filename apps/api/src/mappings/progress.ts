import type { ProgressItem } from '@/modules/db/schema';

export type ProgressItemDto = {
  id: string;
  userId: string;
  mangaId: string;
  chapterId: string;
  updatedAt: string;
  currentPage: number;
  totalPages: number;
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
  };
}
