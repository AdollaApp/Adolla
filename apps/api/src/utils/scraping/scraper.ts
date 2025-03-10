import type { EnumType } from '../types';

export type ChapterContent = {
  id: string;
  url: string;
};

export type Chapter = {
  id: string;
  volumeId: string;
  chapterNum: number;
  name: string;
  publishedAt: Date;
};

export type ChapterContentResult = {
  chapter: Chapter;
  content: ChapterContent[];
};

export type Volume = {
  id: string;
  volumeNum: number;
  name: string;
  publishedAt: Date;
};

export type MangaMeta = {
  id: string;
  status: MangaStatus;
  posterUrl?: string;
  bannerUrl?: string;
  title: string;
  description: string[];
  nsfw: boolean;
};

export const mangaStatus = {
  hiatus: 'hiatus',
  ongoing: 'ongoing',
  finished: 'finished',
  cancelled: 'cancelled',
} as const;
export type MangaStatus = EnumType<typeof mangaStatus>;

export type MangaDetails = {
  meta: MangaMeta;
  volumes: Volume[];
  chapters: Chapter[];
};

export type Scraper = {
  id: string;
  name: string;
  imagePath: string;

  getChapter: (mid: string, cid: string) => Promise<ChapterContentResult>;
  getManga: (mid: string) => Promise<MangaDetails>;
};

export function makeScraper(input: Scraper): Scraper {
  return input;
}
