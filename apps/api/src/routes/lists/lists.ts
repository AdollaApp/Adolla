import { mapList, mapListWithItems } from '@/mappings/list';
import { mapSuccess } from '@/mappings/success';
import { db } from '@/modules/db';
import type { ListItem, MangaMetaDb } from '@/modules/db/schema';
import { listItems, lists, mangaMetas } from '@/modules/db/schema';
import { NotFoundError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { getId } from '@/utils/id';
import { applyPage, mapPage, pagerSchema } from '@/utils/pages';
import { makeRouter } from '@/utils/router';
import { eq, inArray } from 'drizzle-orm';
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

      const listIds = lstQuery.map(v => v.id);
      const listItemsQuery = await db.select().from(listItems).where(inArray(listItems.listId, listIds)).leftJoin(mangaMetas, eq(listItems.mangaMetaId, mangaMetas.id));
      const mappedListItems = listItemsQuery.reduce((a, v) => {
        if (!a[v.list_items.listId]) a[v.list_items.listId] = [];
        a[v.list_items.listId].push({
          ...v.list_items,
          mangaMeta: v.manga_metas,
        });
        return a;
      }, {} as Record<string, (ListItem & { mangaMeta: MangaMetaDb | null })[]>);

      return mapPage(query, lstQuery.map(v => mapListWithItems(v, mappedListItems[v.id] ?? [])), total);
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

  app.patch(
    '/api/v1/lists/:id',
    {
      schema: {
        description: 'Update list',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().min(1).optional(),
        }),
      },
    },
    handle(async ({ auth, params, body }) => {
      auth.check(c => c.isAuthenticated());

      const [list] = await db.select().from(lists)
        .where(eq(lists.id, params.id));
      if (!list)
        throw new NotFoundError();

      auth.check(c => c.isUser(list.userId));

      const [newList] = await db.update(lists).set({
        name: body.name,
      }).where(eq(lists.id, list.id)).returning();

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

      const listItemsQuery = await db.select().from(listItems).where(eq(listItems.listId, list.id)).leftJoin(mangaMetas, eq(listItems.mangaMetaId, mangaMetas.id));
      return mapListWithItems(list, listItemsQuery.map(v => ({ ...v.list_items, mangaMeta: v.manga_metas })));
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
