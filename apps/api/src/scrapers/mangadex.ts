import type { MangaMeta, MangaStatus, Volume } from '@/utils/scraping/scraper';
import { makeScraper, mangaStatus } from '@/utils/scraping/scraper';
import { ofetch } from 'ofetch';

type Res<T> = {
  result: 'ok';
  response: 'entity';
  data: T;
};

type PageRes<T> = {
  result: 'ok';
  response: 'collection';
  data: T[];
  limit: number;
  total: number;
  offset: number;
};

type LanguageRecord<T> = Record<string, T>;

type EntityData<TType, TData = undefined, TRelationships = undefined> = {
  id: string;
  type: TType;
  attributes: TData;
  relationships: TRelationships;
};

type CoverArt = EntityData<'cover_art', {
  description: string;
  volume: string;
  fileName: string;
}>;

type Author = EntityData<'author'>;

type MangaDetails = EntityData<'manga', {
  title: LanguageRecord<string>;
  altTitles: LanguageRecord<string>[];
  description: LanguageRecord<string>;
  status: string;
  year: number;
  state: string;
  contentRating: string;
}, Array<CoverArt | Author>>;

type Chapter = EntityData<'chapter', {
  volume: string;
  chapter: string;
  title: string | null;
  pages: number;
  publishAt: string;
  readableAt: string;
}, Array<EntityData<'manga'>>>;

async function getMangaDetails(mid: string) {
  return await ofetch<Res<MangaDetails>>(`/manga/${mid}`, {
    baseURL: 'https://api.mangadex.org/',
    query: {
      'includes[]': 'cover_art',
    },
  });
}

function getBestLanguageFromMany<T>(langs: LanguageRecord<T>[]): T {
  return getBestLanguage(langs.reduce((a, v) => ({ ...a, ...v }), {} as LanguageRecord<T>));
}

function getBestLanguage<T>(langs: LanguageRecord<T>): T {
  if (langs['en']) return langs['en'];
  if (langs['ja-ro']) return langs['ja-ro'];
  if (langs['ja']) return langs['ja'];
  const keys = Object.keys(langs);
  return langs[keys[0]];
}

function getStatus(status: string): MangaStatus {
  if (status === 'completed') return mangaStatus.finished;
  return mangaStatus.ongoing; // TODO fill out the rest
}

function makeMetaFromDetails(details: MangaDetails): MangaMeta {
  const coverArt = details.relationships.find(v => v.type === 'cover_art');
  return {
    id: details.id,
    description: [getBestLanguage(details.attributes.description)],
    nsfw: details.attributes.contentRating !== 'safe',
    posterUrl: coverArt ? `https://uploads.mangadex.org/covers/${details.id}/${coverArt.attributes.fileName}.512.jpg` : undefined,
    title: getBestLanguageFromMany(details.attributes.altTitles),
    status: getStatus(details.attributes.status),
  };
}

async function getChapters(mid: string) {
  const limit = 500;
  let allChapters: Chapter[] = [];
  let offset = 0;
  while (true) {
    const newChapters = await ofetch<PageRes<Chapter>>(`/manga/${mid}/feed`, {
      baseURL: 'https://api.mangadex.org/',
      query: {
        'order[volume]': 'desc',
        'order[chapter]': 'desc',
        'offset': offset,
        'limit': limit,
      },
    });
    allChapters = [...allChapters, ...newChapters.data];
    if (newChapters.offset + newChapters.limit >= newChapters.total)
      return allChapters;
    offset += limit;
  }
}

export const mangadex = makeScraper({
  id: 'mangadex',
  name: 'Mangadex',
  imagePath: '/scrapers/mangadex.png',
  async getChapter(_mid, _cid) {
    // TODO implement
    return {
      chapter: {
        id: 'abc',
        chapterNum: 42,
        name: 'My first chapter',
        publishedAt: new Date(),
        volumeId: 'def',
      },
      content: [{
        id: '123',
        url: 'https://google.com',
      }],
    };
  },
  async getManga(mid) {
    const { data: manga } = await getMangaDetails(mid);
    const chapters = await getChapters(mid);

    const alreadyDoneVolumes: string[] = [];
    const volumes: Volume[] = [];
    chapters.forEach((c) => {
      const hasVolume = alreadyDoneVolumes.includes(c.attributes.volume);
      if (!hasVolume) {
        volumes.push({
          id: c.attributes.volume,
          name: `Volume ${c.attributes.volume}`,
          publishedAt: new Date(c.attributes.readableAt),
          volumeNum: Number(c.attributes.volume),
        });
        alreadyDoneVolumes.push(c.attributes.volume);
      }
    });

    // TODO remove duplicate chapters, only pick best one

    return {
      meta: makeMetaFromDetails(manga),
      volumes,
      chapters: chapters.map(c => ({
        id: c.id,
        chapterNum: Number(c.attributes.chapter),
        name: c.attributes.title ? c.attributes.title : c.attributes.chapter,
        publishedAt: new Date(c.attributes.publishAt),
        volumeId: c.attributes.volume,
      })),
    };
  },
});
