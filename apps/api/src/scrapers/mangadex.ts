import { makeScraper } from '@/utils/scraping/scraper';

export const mangadex = makeScraper({
  id: 'mangadex',
  name: 'Mangadex',
  imagePath: '/mangadex.png',
  getChapter(_mid, _cid) {
    // TODO implement
  },
  getManga(_mid) {
    // TODO implement
  },
});
