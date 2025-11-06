import type { Scraper } from '@/utils/scraping/scraper';
import { mangadex } from './mangadex';
import { weebcentral } from './weebcentral';

export const scrapers: Scraper[] = [
  mangadex,
  weebcentral,
];
