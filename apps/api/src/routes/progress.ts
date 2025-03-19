import { mapProgressItem } from '@/mappings/progress';
import { mapSuccess } from '@/mappings/success';
import { db } from '@/modules/db';
import { mangaMetas, progressItems } from '@/modules/db/schema';
import { NotFoundError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { getId } from '@/utils/id';
import { makeRouter } from '@/utils/router';
import { and, eq } from 'drizzle-orm';
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
      const items = await db.select().from(progressItems)
        .where(and(eq(progressItems.mangaId, params.mid), eq(progressItems.userId, uid)));

      return items.map(v => mapProgressItem(v));
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

      const [item] = await db.select().from(progressItems)
        .where(and(eq(progressItems.mangaId, params.mid), eq(progressItems.userId, uid), eq(progressItems.chapterId, params.cid)));

      if (!item)
        throw new NotFoundError();

      return mapProgressItem(item);
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
    handle(async ({ auth, params, body }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      const [existingItem] = await db.select().from(progressItems)
        .where(and(eq(progressItems.mangaId, params.mid), eq(progressItems.userId, uid), eq(progressItems.chapterId, params.cid)));

      if (!existingItem) {
        const [mangaMeta] = await db.select().from(mangaMetas)
          .where(eq(mangaMetas.id, params.mid));
        if (!mangaMeta) throw new Error('No meta exists for this manga ID');

        const [newItem] = await db.insert(progressItems).values({
          id: getId('prg'),
          chapterId: params.cid,
          mangaId: params.mid,
          updatedAt: new Date(),
          userId: uid,
          currentPage: body.currentPage,
          totalPages: body.totalPages,
          mangaMetaId: mangaMeta.id,
        }).returning();
        return mapProgressItem(newItem);
      }

      const [newItem] = await db.update(progressItems).set({
        currentPage: body.currentPage,
        totalPages: body.totalPages,
        updatedAt: new Date(),
      }).where(eq(progressItems.id, existingItem.id)).returning();

      return mapProgressItem(newItem);
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
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      const [existingItem] = await db.select().from(progressItems)
        .where(and(eq(progressItems.mangaId, params.mid), eq(progressItems.userId, uid), eq(progressItems.chapterId, params.cid)));

      if (!existingItem)
        throw new NotFoundError();

      await db.delete(progressItems).where(eq(progressItems.id, existingItem.id)).returning();

      return mapSuccess();
    }),
  );
});
