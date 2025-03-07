import { scrapers } from '@/scrapers';
import type { Scraper } from './scraper';

export function getScraper(id: string): Scraper | null {
  return scrapers.find(v => v.id === id) ?? null;
}
