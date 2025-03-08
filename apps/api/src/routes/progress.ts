import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { z } from 'zod';

export const progressRouter = makeRouter((app) => {
  app.get(
    '/api/v1/users/:uid/progress/:mid',
    {
      schema: {
        description: 'Get manga progress for user',
        params: z.object({
          uid: z.string(),
          mid: z.string(),
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
    '/api/v1/users/:uid/progress/:mid/items/:cid',
    {
      schema: {
        description: 'Get chapter progress for user',
        params: z.object({
          uid: z.string(),
          mid: z.string(),
          cid: z.string(),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      return true; // TODO add implementation
    }),
  );

  app.put(
    '/api/v1/users/:uid/progress/:mid/items/:cid',
    {
      schema: {
        description: 'Create or replace chapter progress for user',
        params: z.object({
          uid: z.string(),
          mid: z.string(),
          cid: z.string(),
        }),
        body: z.object({
          totalPages: z.number().min(1),
          currentPage: z.number().min(1),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      return true; // TODO add implementation
    }),
  );

  app.delete(
    '/api/v1/users/:uid/progress/:mid/items/:cid',
    {
      schema: {
        description: 'Delete chapter progress for user',
        params: z.object({
          uid: z.string(),
          mid: z.string(),
          cid: z.string(),
        }),
        body: z.object({
          totalPages: z.number().min(1),
          currentPage: z.number().min(1),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      return true; // TODO add implementation
    }),
  );
});
