import { JSDOM } from 'jsdom';

import { createProxyUrl } from '@/utils/proxy';
import { cacheTypes, chapterContentCacheTimeMs, getFromCache, mangaMetaCacheTimeMs, saveToCache } from '@/utils/scraping/cache';
import type { Chapter, MangaMeta, MangaStatus } from '@/utils/scraping/scraper';
import { makeScraper, mangaStatus } from '@/utils/scraping/scraper';
import { ofetch } from 'ofetch';
import { logger } from '@/modules/log';

function getDocumentFromHtml(html: string) {
  const { window } = new JSDOM(html);
  return window.document;
}

interface BatDetails {
  title: string;
  description: string;
  // year: string;
  status: string;
  posterUrl: string | null;
  id: string;
  tags: string[];
  chapters: BatChapter[];
}

interface BatChapter {
  chapterId: string;
  title: string;
  issueNumber: number;
}

async function getComicDetails(comicId: string) {
  // ! Main page
  // https://batcave.biz/
  const htmlResponse = await ofetch<string>(`${comicId}.html`, {
    baseURL: 'https://batcave.biz',
  });
  const document = getDocumentFromHtml(htmlResponse);

  const title = document.querySelector('h1')?.innerText.trim() || 'Unknown';
  const description = document.querySelector<HTMLDivElement>('div.page__text.full-text.clearfix')?.innerText.trim() || 'Unknown';
  const posterUrl = document.querySelector<HTMLImageElement>('.page__poster img')?.src ?? null;

  const statsEntries = Array.from(document.querySelectorAll<HTMLLIElement>('.page__list li')) || [];
  const status = statsEntries.find((entry) => {
    return entry.innerText.includes('Release type');
  })?.querySelector('a')?.innerText || 'Unknown';

  const metadata = JSON.parse(document.querySelectorAll<HTMLScriptElement>('[type="application/ld+json"]')?.[1]?.innerHTML);
  const comicMetaData = metadata?.['@graph']?.find((entry: any) => entry['@type'] === 'ComicSeries');

  let chapters: BatChapter[] = [];
  let tags: string[] = [];
  if (comicMetaData) {
    tags = comicMetaData.genre;
    chapters = comicMetaData.hasPart.itemListElement.map((entry: any) => {
      const item = entry.item;
      const res: BatChapter = {
        title: item.name,
        chapterId: item['@id'].split('/').pop(),
        issueNumber: Number(item.issueNumber),
      };
      return res;
    });
  }

  // Build res
  const res: BatDetails = {
    title,
    description,
    // year,
    status,
    posterUrl,
    tags,
    chapters,
    id: comicId,
  };
  return res;
}

function getStatus(status: string): MangaStatus {
  if (status === 'Completed' || status === 'Complete') return mangaStatus.finished;
  if (status === 'Ongoing') return mangaStatus.ongoing;
  if (status === 'Cancelled') return mangaStatus.cancelled;
  if (status === 'Hiatus') return mangaStatus.hiatus;
  if (status === 'Ongoing') return mangaStatus.ongoing;
  logger.warn('Unknown Weebcentral status:', status.repeat(500));
  return mangaStatus.unknown;
}

function makeMetaFromDetails(details: BatDetails): MangaMeta {
  const coverArt = details.posterUrl ? createProxyUrl(details.posterUrl) : undefined;
  const isNsfw = false;
  return {
    title: details.title,
    description: details.description.split('\n'),
    posterUrl: coverArt,
    bannerUrl: coverArt,
    id: details.id,
    nsfw: isNsfw,
    status: getStatus(details.status || ''),
    tags: details.tags,
  };
}

function makeChapterMeta(chapter: BatChapter): Chapter {
  const chapterName = chapter.title;
  const volumeId = chapterName.match(/S(\d+)/)?.[1];
  return {
    id: chapter.chapterId,
    chapterNum: Number(
      chapterName
        .split(' ')
        .filter(t => !isNaN(Number(t.replace(/[^0-9.]/g, '') || NaN)))
        .map(t => t.padStart(4, '0'))
        .join('0')
        .replace(/[^0-9.]/g, ''),
    ),
    name: chapterName,
    publishedAt: new Date(chapter.issueNumber || '1980-01-01'),
    volumeId,
  };
}

async function getChapterImagesDoc(mid: string, cid: string) {
  // https://batcave.biz/reader/33051/246259
  const htmlResponse = await ofetch<string>(`/reader/${mid.split('-')[0]}/${cid}`, {
    baseURL: 'https://batcave.biz',
  });
  return getDocumentFromHtml(htmlResponse);
}

export const batcave = makeScraper({
  id: 'batcave',
  name: 'BatCave',
  imagePath: '/scrapers/weebcentral.png',
  async getChapter(mid, cid) {
    let comic = await getFromCache<BatDetails>([cacheTypes.mangaMeta, mid]);
    if (!comic) {
      const detailsRes = await getComicDetails(mid);
      comic = detailsRes;
      await saveToCache([cacheTypes.mangaMeta, mid], comic, mangaMetaCacheTimeMs);
    }

    let chapterData = await getFromCache<{ chapter: Chapter; content: string[] }>([cacheTypes.chapterContent, mid, cid]);
    if (!chapterData) {
      const chapterImagesDoc = await getChapterImagesDoc(mid, cid);
      const chapterInList = comic.chapters.find(c => c.chapterId === cid);

      if (!chapterInList) throw new Error('Chapter not found');

      chapterData = {
        chapter: makeChapterMeta(chapterInList),
        content: Array.from(chapterImagesDoc.querySelectorAll('[decoding="async"]')).map(t => t.getAttribute('src')).filter(Boolean) as string[],
      };
      await saveToCache([cacheTypes.chapterContent, mid, cid], chapterData, chapterContentCacheTimeMs);
    }

    chapterData.chapter.publishedAt = new Date(chapterData.chapter.publishedAt);

    const { chapter } = chapterData;
    return {
      chapter,
      content: chapterData.content.map((url) => {
        return {
          url,
          id: url,
        };
      }),
    };
  },
  async getManga(mid) {
    let manga: BatDetails = await getFromCache<any>([cacheTypes.mangaMeta, mid]);
    if (!manga) {
      const detailsRes = await getComicDetails(mid);
      manga = detailsRes;
      await saveToCache([cacheTypes.mangaMeta, mid], manga, mangaMetaCacheTimeMs);
    }

    return {
      meta: makeMetaFromDetails(manga),
      volumes: [],
      chapters: manga.chapters.map(makeChapterMeta),
    };
  },
  async search(ops) {
    // https://batcave.biz/search/Absolute#chapters
    const htmlResponse = await ofetch<string>(`search/${encodeURIComponent(ops.query)}#chapters`, {
      baseURL: 'https://batcave.biz/',
    });
    const document = getDocumentFromHtml(htmlResponse);

    const results: BatDetails[] = Array.from(document.querySelectorAll('.readed.d-flex.short')).map((resultEl) => {
      const res: BatDetails = {
        title: resultEl.querySelector('.readed__title a')?.textContent || 'Unknown',
        description: resultEl.querySelector('.readed__info li')?.textContent || '',
        status: mangaStatus.unknown,
        posterUrl: resultEl.querySelector('img')?.src || null,
        tags: [],
        chapters: [],
        id: resultEl.querySelector('a')?.href.split('/').pop()?.split('.')[0] || '',
      };
      return res;
    });

    return results.map((result) => {
      return {
        id: result.id,
        meta: makeMetaFromDetails(result),
      };
    });
  },
});
