import { mapMangaSearchResult } from '@/mappings/manga';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { getScraper } from '@/utils/scraping/run';
import { z } from 'zod';

export const searchRouter = makeRouter((app) => {
  app.post(
    '/api/v1/search',
    {
      schema: {
        description: 'Search in scrapers',
        body: z.object({
          scraperId: z.string(),
          query: z.string().min(3),
        }),
      },
    },
    handle(async ({ body }) => {
      const scraper = getScraper(body.scraperId);
      if (!scraper) throw new Error('Invalid scraper');
      const results = await scraper.search({
        limit: 32,
        query: body.query,
      });

      return results.map(v => mapMangaSearchResult(scraper.id, v));
    }),
  );
});
