export type ChapterContentDto = {
  id: string;
  url: string;
};

export type ChapterDto = {
  id: string;
  volumeId: string;
  chapterNum: number;
  name: string;
  publishedAt: Date;
};

export type ChapterViewDto = {
  id: string;
  chapter: ChapterDto;
  content: ChapterContentDto[];
};

export function mapChapterContent(_data: any): any {
  return {}; // TODO map it for real
}
