import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { z } from 'zod';

export const listItemRouter = makeRouter((app) => {
  app.post(
    '/api/v1/lists/:id/items',
    {
      schema: {
        description: 'Add entry to list',
        params: z.object({
          IDBCursor: z.string(),
        }),
      },
    },
    handle(async ({ auth }) => {
      auth.check(c => c.isAuthenticated());

      // TODO check if user has access

      return true; // TODO add implementation
    }),
  );

  app.delete(
    '/api/v1/lists/:lid/items/:id',
    {
      schema: {
        description: 'Remove entry from list',
        params: z.object({
          lid: z.string(),
          id: z.string(),
        }),
      },
    },
    handle(async ({ auth }) => {
      auth.check(c => c.isAuthenticated());

      // TODO check if user has access

      return true; // TODO add implementation
    }),
  );
});
