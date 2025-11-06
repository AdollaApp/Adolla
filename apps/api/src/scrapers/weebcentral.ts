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

interface WcChapter {
  title: string;
  cid?: string;
  date: string;
}

interface WcMangaDetails {
  title: string;
  description: string;
  posterUrl?: string;
  status?: string;
  tags: string[];
  mid: string;
  chapters: WcChapter[];
}

async function getMangaDetails(mid: string) {
  // ! Main page
  const htmlResponse = await ofetch<string>(`series/${mid}/whatever`, {
    baseURL: 'https://weebcentral.com/',
  });
  const mainDoc = getDocumentFromHtml(htmlResponse);

  // ! Full chapters res
  const htmlResponseChapters = await ofetch<string>(`series/${mid}/full-chapter-list`, {
    baseURL: 'https://weebcentral.com/',
  });
  const chaptersDoc = getDocumentFromHtml(`<html><body>${htmlResponseChapters}</body></html>`);

  // Chapters
  const chapters = Array.from(chaptersDoc.querySelectorAll('a')).slice(0, -1).map((chapterEl) => {
    return {
      title: (chapterEl.querySelector('.grow > span')?.textContent || 'No chapter name'),
      cid: chapterEl?.href.split('/').pop(),
      date: chapterEl.querySelector('time')?.getAttribute('datetime') || 'Unknown',
    };
  });

  // Find status
  const sidebarListItems = Array.from(mainDoc.querySelectorAll('ul.flex.flex-col li'));
  const status = sidebarListItems.find((listItem) => {
    return (listItem.textContent.includes('Status'));
  })?.querySelector('a')?.textContent;

  // Find genres (Bruh)
  const genres = Array.from(sidebarListItems.find((listItem) => {
    return listItem.textContent.includes('Tag');
  })?.querySelectorAll('span') || []).map(t => t.textContent.replaceAll(',', '').trim());

  // Build res
  const res: WcMangaDetails = {
    title: mainDoc.querySelector('.text-2xl.font-bold')?.textContent || 'No title found',
    description: mainDoc.querySelector('p.whitespace-pre-wrap.break-words')?.textContent || '',
    posterUrl: (mainDoc.querySelector('picture img')?.getAttribute('src') || undefined),
    tags: genres,
    status,
    chapters,
    mid: mid,
  };
  return res;
}

function getStatus(status: string): MangaStatus {
  if (status === 'Completed') return mangaStatus.finished;
  if (status === 'Ongoing') return mangaStatus.ongoing;
  if (status === 'Cancelled') return mangaStatus.cancelled;
  if (status === 'Hiatus') return mangaStatus.hiatus;
  if (status === 'Ongoing') return mangaStatus.ongoing;
  logger.warn('Unknown Weebcentral status:', status.repeat(500));
  return mangaStatus.unknown;
}

function makeMetaFromDetails(details: WcMangaDetails): MangaMeta {
  const coverArt = details.posterUrl ? createProxyUrl(details.posterUrl) : undefined;
  const isNsfw = details.tags.some((tag) => {
    const l = tag.toLowerCase();
    return l === 'ecchi' || l === 'mature';
  });
  return {
    title: details.title,
    description: details.description.split('\n'),
    posterUrl: coverArt,
    bannerUrl: coverArt,
    id: details.mid,
    nsfw: isNsfw,
    status: getStatus(details.status || ''),
    tags: details.tags,
  };
}

function makeChapterMeta(chapter: WcChapter): Chapter {
  const cid = chapter.cid;
  const chapterName = chapter.title;
  const volumeId = chapterName.match(/S(\d+)/)?.[1];
  return {
    id: cid as string,
    chapterNum: Number(chapterName.split(' ').pop()),
    name: chapterName,
    publishedAt: new Date(chapter.date || '1980-01-01'),
    volumeId,
  };
}

async function getChapterImagesDoc(cid: string) {
  const htmlResponse = await ofetch<string>(`chapters/${cid}/images?is_prev=False&current_page=1&reading_style=long_strip`, {
    baseURL: 'https://weebcentral.com/',
  });
  return getDocumentFromHtml(htmlResponse);
}

export const weebcentral = makeScraper({
  id: 'weebcentral',
  name: 'Weebcentral',
  imagePath: '/scrapers/weebcentral.png',
  async getChapter(mid, cid) {
    let manga: WcMangaDetails = await getFromCache<any>([cacheTypes.mangaMeta, mid]);
    if (!manga) {
      const detailsRes = await getMangaDetails(mid);
      manga = detailsRes;
      await saveToCache([cacheTypes.mangaMeta, mid], manga, mangaMetaCacheTimeMs);
    }

    let chapterData = await getFromCache<{ chapter: Chapter; content: string[] }>([cacheTypes.chapterContent, mid, cid]);
    if (!chapterData) {
      const chapterImagesDoc = await getChapterImagesDoc(cid);
      const chapterInList = manga.chapters.find(c => c.cid === cid);

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
    let manga: WcMangaDetails = await getFromCache<any>([cacheTypes.mangaMeta, mid]);
    if (!manga) {
      const detailsRes = await getMangaDetails(mid);
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
    console.log(ops);
    // TODO search
    return [];
  },
});
