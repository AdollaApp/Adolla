import type { EnumType } from '@/utils/types';
import type { ChapterDto } from './chapter';

export type ProviderDto = {
  id: string;
  name: string;
  image: string;
};

export type VolumeDto = {
  id: string;
  volumeNum: number;
  name: string;
  publishedAt: Date;
};

export type MangaMetaDto = {
  id: string;
  status: MangaStatus;
  posterUrl: string;
  bannerUrl?: string;
  title: string;
  description: string[];
  nsfw: boolean;
};

export const mangaStatus = {
  hiatus: 'hiatus',
  ongoing: 'ongoing',
  finished: 'finished',
} as const;
export type MangaStatus = EnumType<typeof mangaStatus>;

export type MangaDetailsDto = {
  id: string;
  provider: ProviderDto;
  meta: MangaMetaDto;
  volumes: VolumeDto[];
  chapters: ChapterDto[];
};

export function mapMangaDetails(_data: any): any {
  return {}; // TODO map it for real
}
