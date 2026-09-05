import type { Scraper } from '@/utils/scraping/scraper';
import { mangadex } from './mangadex';
import { weebcentral } from './weebcentral';
// import { batcave } from './batcave';

export const scrapers: Scraper[] = [
  mangadex,
  weebcentral,
  // batcave,
];
