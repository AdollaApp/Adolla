import type { MangaMeta } from './scraper';

export type MangaMetaCacheItem = {
  meta: MangaMeta;
  scraperId: string;
};

export function buildMangaMetaCache(scraperId: string, meta: MangaMeta): MangaMetaCacheItem {
  return {
    meta,
    scraperId,
  };
}
