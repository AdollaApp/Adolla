import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { z } from 'zod';

export const listsRouter = makeRouter((app) => {
  app.get(
    '/api/v1/users/:uid/lists',
    {
      schema: {
        description: 'Get lists for user',
        params: z.object({
          uid: z.string(),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      return true; // TODO add implementation
    }),
  );

  app.post(
    '/api/v1/users/:uid/lists',
    {
      schema: {
        description: 'Create list',
        params: z.object({
          uid: z.string(),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      return true; // TODO add implementation
    }),
  );

  app.get(
    '/api/v1/lists/:id',
    {
      schema: {
        description: 'Get list',
        params: z.object({
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

  app.delete(
    '/api/v1/lists/:id',
    {
      schema: {
        description: 'Delete list',
        params: z.object({
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
