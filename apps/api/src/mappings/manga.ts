import { mapChapter, type ChapterDto } from './chapter';
import type { MangaDetails, MangaMeta, MangaSearchResult, MangaStatus, Volume } from '@/utils/scraping/scraper';
import { getScrapersMeta, makeMangaId } from '@/utils/scraping/manga-id';

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

export function mapMangaMeta(data: MangaMeta): MangaMetaDto {
  return {
    id: data.id,
    description: data.description,
    nsfw: data.nsfw,
    posterUrl: data.posterUrl,
    status: data.status,
    title: data.title,
    bannerUrl: data.bannerUrl,
  };
}

export function mapVolume(data: Volume): VolumeDto {
  return {
    id: data.id,
    name: data.name,
    publishedAt: data.publishedAt.toISOString(),
    volumeNum: data.volumeNum,
  };
}

export function mapScraper(id: string): ScraperDto {
  const scraper = getScrapersMeta(id);
  if (!scraper) throw new Error('Could not map scraper');
  return {
    id: scraper.id,
    name: scraper.name,
    image: scraper.image,
  };
}

export function mapMangaDetails(scraperId: string, data: MangaDetails): MangaDetailsDto {
  return {
    id: data.meta.id,
    meta: mapMangaMeta(data.meta),
    scraper: mapScraper(scraperId),
    volumes: data.volumes.map(v => mapVolume(v)),
    chapters: data.chapters.map(v => mapChapter(v)),
  };
}

export function mapMangaSearchResult(scraperId: string, result: MangaSearchResult): MangaSearchResultDto {
  return {
    mangaId: makeMangaId(scraperId, result.id),
    meta: mapMangaMeta(result.meta),
    scraper: mapScraper(scraperId),
  };
}
