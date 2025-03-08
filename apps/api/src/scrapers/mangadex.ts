import { makeScraper } from '@/utils/scraping/scraper';

export const mangadex = makeScraper({
  id: 'mangadex',
  name: 'Mangadex',
  imagePath: '/mangadex.png',
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
  async getManga(_mid) {
    // TODO implement
    return {
      meta: {
        id: '123',
        nsfw: false,
        status: 'finished',
        posterUrl: 'https://google.com',
        title: 'God of tower',
        description: ['funny text here'],
      },
      chapters: [{
        id: 'abc',
        chapterNum: 42,
        name: 'My first chapter',
        publishedAt: new Date(),
        volumeId: 'def',
      }],
      volumes: [{
        id: 'def',
        name: 'The volume of the week',
        publishedAt: new Date(),
        volumeNum: 24,
      }],
    };
  },
});
