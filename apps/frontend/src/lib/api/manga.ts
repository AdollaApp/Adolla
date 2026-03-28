export type EnumType<E extends Record<string, string>> = E[keyof E];

export const mangaStatus = {
  hiatus: "hiatus",
  ongoing: "ongoing",
  finished: "finished",
  cancelled: "cancelled",
} as const;
export type MangaStatus = EnumType<typeof mangaStatus>;

export type ChapterContentDto = {
  id: string;
  url: string;
};

export type ChapterDto = {
  id: string;
  volumeId: string;
  chapterNum: number;
  name: string;
  publishedAt: string;
};

export type ChapterViewDto = {
  id: string;
  chapter: ChapterDto;
  content: ChapterContentDto[];
};

export type ScraperDto = {
  id: string;
  name: string;
  image?: string;
};

export type VolumeDto = {
  id: string;
  volumeNum: number;
  name: string;
  publishedAt: string;
};

export type MangaMetaDto = {
  id: string;
  status: MangaStatus;
  posterUrl?: string;
  bannerUrl?: string;
  title: string;
  description: string[];
  nsfw: boolean;
  tags: string[];
};

export type MangaDetailsDto = {
  id: string;
  scraper: ScraperDto;
  meta: MangaMetaDto;
  volumes: VolumeDto[];
  chapters: ChapterDto[];
};

export type MangaSearchResultDto = {
  mangaId: string;
  scraper: ScraperDto;
  meta: MangaMetaDto;
};

export type ProgressItemDto = {
  chapterId: string;
  currentPage: number;
  id: string;
  mangaId: string;
  mangaMeta: MangaMetaDto;
  totalPages: number;
  updatedAt: string;
  userId: string;
};
