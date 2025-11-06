import type { Chapter, ChapterContent, ChapterContentResult } from '@/utils/scraping/scraper';

export type ChapterContentDto = {
  id: string;
  url: string;
};

export type ChapterDto = {
  id: string;
  volumeId?: string;
  chapterNum: number;
  name: string;
  publishedAt: string;
};

export type ChapterViewDto = {
  id: string;
  chapter: ChapterDto;
  content: ChapterContentDto[];
};

export function mapChapterContent(data: ChapterContent): ChapterContentDto {
  return {
    id: data.id,
    url: data.url,
  };
}

export function mapChapter(data: Chapter): ChapterDto {
  return {
    id: data.id,
    name: data.name,
    chapterNum: data.chapterNum,
    publishedAt: data.publishedAt.toISOString(),
    volumeId: data.volumeId,
  };
}

export function mapChapterContentResult(data: ChapterContentResult): ChapterViewDto {
  return {
    id: data.chapter.id,
    chapter: mapChapter(data.chapter),
    content: data.content.map(v => mapChapterContent(v)),
  };
}
