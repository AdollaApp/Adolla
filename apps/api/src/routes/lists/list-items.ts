import { mapListItem } from '@/mappings/list';
import { mapSuccess } from '@/mappings/success';
import { db } from '@/modules/db';
import { listItems, lists } from '@/modules/db/schema';
import { NotFoundError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { getId } from '@/utils/id';
import { makeRouter } from '@/utils/router';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const listItemRouter = makeRouter((app) => {
  app.post(
    '/api/v1/lists/:id/items',
    {
      schema: {
        description: 'Add entry to list',
        params: z.object({
          id: z.string(),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      auth.check(c => c.isAuthenticated());

      const [list] = await db.select().from(lists)
        .where(eq(lists.id, params.id));
      if (!list) throw new NotFoundError();
      auth.check(c => c.isUser(list.userId));

      const [newItem] = await db.insert(listItems).values({
        id: getId('ltm'),
        listId: list.id,
      }).returning();

      return mapListItem(newItem);
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
    handle(async ({ auth, params }) => {
      auth.check(c => c.isAuthenticated());

      const [listItem] = await db.select().from(listItems).leftJoin(lists, eq(lists.id, listItems.listId))
        .where(and(eq(listItems.listId, params.lid), eq(listItems.id, params.id)));
      const list = listItem.lists;
      if (!listItem || !list) throw new NotFoundError();
      auth.check(c => c.isUser(list.userId));

      await db.delete(listItems).where(eq(listItems.id, listItem.list_items.id));

      return mapSuccess();
    }),
  );
});
