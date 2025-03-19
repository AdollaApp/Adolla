import type { MangaMetaCacheItem } from '@/utils/scraping/cache';
import type { MangaMetaDto, ScraperDto } from './manga';
import { mapMangaMeta, mapScraper } from './manga';

export type MangaCacheItemDto = {
  scraper: ScraperDto;
  meta: MangaMetaDto;
};

export function mapMangaCacheItem(cache: MangaMetaCacheItem): MangaCacheItemDto {
  return {
    meta: mapMangaMeta(cache.meta),
    scraper: mapScraper(cache.scraperId),
  };
}
