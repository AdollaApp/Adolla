import { conf } from '@/config';
import { scrapers } from '@/scrapers';

export type ScraperMeta = {
  id: string;
  name: string;
  image?: string;
};

export type MangaId = {
  scraperId: string;
  id: string;
};

export function decodeMangaId(mid: string): MangaId | null {
  const [scraperId, entryId] = mid.split(':', 2);
  if (!scraperId || !entryId)
    return null;

  return {
    id: entryId,
    scraperId,
  };
}

export function makeMangaId(scraperId: string, entryId: string): string {
  return `${scraperId}:${entryId}`; // very sophisticated, I know
}

export function getScrapersMeta(scraperId: string): ScraperMeta | null {
  const scraper = scrapers.find(v => v.id === scraperId);
  if (!scraper) return null;
  return {
    id: scraper.id,
    name: scraper.name,
    image: `${conf.server.backendBaseUrl.slice(0, -1)}${scraper.imagePath}`,
  };
}
