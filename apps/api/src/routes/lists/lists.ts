import { mapList } from '@/mappings/list';
import { mapSuccess } from '@/mappings/success';
import { db } from '@/modules/db';
import { lists } from '@/modules/db/schema';
import { NotFoundError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { getId } from '@/utils/id';
import { applyPage, mapPage, pagerSchema } from '@/utils/pages';
import { makeRouter } from '@/utils/router';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const listsRouter = makeRouter((app) => {
  app.get(
    '/api/v1/users/:uid/lists',
    {
      schema: {
        description: 'Get lists for user',
        querystring: pagerSchema(),
        params: z.object({
          uid: z.string(),
        }),
      },
    },
    handle(async ({ auth, params, query }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      const baseQuery = db.select().from(lists).where(eq(lists.userId, uid));
      const lstQuery = await applyPage(baseQuery, query);
      const total = await db.$count(baseQuery);

      return mapPage(query, lstQuery.map(mapList), total);
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
        body: z.object({
          name: z.string().min(1),
        }),
      },
    },
    handle(async ({ auth, params, body }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      const [newList] = await db.insert(lists).values({
        id: getId('lst'),
        userId: uid,
        name: body.name,
      }).returning();

      return mapList(newList);
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
    handle(async ({ auth, params }) => {
      auth.check(c => c.isAuthenticated());

      const [list] = await db.select().from(lists)
        .where(eq(lists.id, params.id));
      if (!list)
        throw new NotFoundError();

      auth.check(c => c.isUser(list.userId));

      return mapList(list);
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
    handle(async ({ auth, params }) => {
      auth.check(c => c.isAuthenticated());

      const [list] = await db.select().from(lists)
        .where(eq(lists.id, params.id));
      if (!list)
        throw new NotFoundError();

      auth.check(c => c.isUser(list.userId));

      await db.delete(lists).where(eq(lists.id, params.id));

      return mapSuccess();
    }),
  );
});
