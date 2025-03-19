import { decodeMangaId } from '@/utils/scraping/manga-id';
import { mapMangaMeta, mapScraper, type MangaMetaDto, type ScraperDto } from './manga';
import type { MangaMetaDb } from '@/modules/db/schema';

export type MangaMetaDbDto = {
  id: string;
  scraper: ScraperDto;
  meta: MangaMetaDto;
};

export function mapMangaMetaDb(item: MangaMetaDb): MangaMetaDbDto {
  const ids = decodeMangaId(item.id);
  if (!ids) throw new Error('Could not map manga ID');

  return {
    id: item.id,
    scraper: mapScraper(ids.scraperId),
    meta: mapMangaMeta(JSON.parse(item.data)),
  };
}
