import { db } from '@/modules/db';
import type { MangaMeta } from './scraper';
import { cacheItems, mangaMetas } from '@/modules/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { makeMangaId } from './manga-id';

// TODO expiry cache items on schedule

// bump this number if you make changes to the format of any cache item
const cacheVersion = 1;

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

export async function saveMetaData(scraperId: string, meta: MangaMeta) {
  // TODO this stores the proxied image url, maybe it should store raw
  const dataStr = JSON.stringify(buildMangaMetaCache(scraperId, meta));
  await db.insert(mangaMetas).values({
    id: makeMangaId(scraperId, meta.id),
    data: dataStr,
  }).onConflictDoUpdate({
    target: mangaMetas.id,
    set: {
      data: dataStr,
    },
  });
}

export const cacheTypes = {
  chapterContent: 'chapter-content',
  chapterList: 'chapter-list',
  mangaMeta: 'manga-meta',
};

export const mangaMetaCacheTimeMs = 24 * 60 * 60 * 1000; // 24 hours
export const chapterListCacheTimeMs = 1 * 60 * 60 * 1000; // 1 hour
// TODO dynamic cache time based on release (short the few days after release, long cache after)
export const chapterContentCacheTimeMs = 15 * 60 * 1000; // 15 minutes

function makeKey(key: string[]) {
  return `${cacheVersion}/${key.join('/')}`;
}

export async function saveToCache<T>(key: string[], data: T, expiryMs: number): Promise<void> {
  const dataStr = JSON.stringify(data);
  await db.insert(cacheItems).values({
    data: dataStr,
    expiresAt: new Date(Date.now() + expiryMs),
    key: makeKey(key),
  }).onConflictDoUpdate({
    target: cacheItems.key,
    set: {
      data: dataStr,
      expiresAt: new Date(Date.now() + expiryMs),
    },
  });
}

export async function getFromCache<T>(key: string[]): Promise<T | null> {
  const [item] = await db.select().from(cacheItems).where(and(eq(cacheItems.key, makeKey(key)), gte(cacheItems.expiresAt, new Date())));
  if (!item?.data) return null;
  return JSON.parse(item.data) as T;
}
