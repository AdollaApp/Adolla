import { mapChapterContent } from '@/mappings/chapter';
import { mapMangaDetails } from '@/mappings/manga';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { decodeMangaId } from '@/utils/scraping/manga-id';
import { getScraper } from '@/utils/scraping/run';
import { z } from 'zod';

export const mangaRouter = makeRouter((app) => {
  app.get(
    '/api/v1/manga/:mid',
    {
      schema: {
        description: 'Get manga details',
        params: z.object({
          mid: z.string(),
        }),
      },
    },
    handle(async ({ params }) => {
      const ids = decodeMangaId(params.mid);
      if (!ids) throw new Error('Invalid ID');
      const scraper = getScraper(ids.scraperId);
      if (!scraper) throw new Error('Invalid scraper');
      const result = await scraper.getManga(ids.id);

      return mapMangaDetails(result);
    }),
  );

  app.get(
    '/api/v1/manga/:mid/chapters/:cid',
    {
      schema: {
        description: 'Get manga chapter details',
        params: z.object({
          mid: z.string(),
          cid: z.string(),
        }),
      },
    },
    handle(async ({ params }) => {
      const ids = decodeMangaId(params.mid);
      if (!ids) throw new Error('Invalid ID');
      const scraper = getScraper(ids.scraperId);
      if (!scraper) throw new Error('Invalid scraper');
      const result = await scraper.getChapter(ids.id, params.cid);

      return mapChapterContent(result);
    }),
  );
});
