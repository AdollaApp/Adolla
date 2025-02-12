import { db } from '@/modules/db';
import { usersTable } from '@/modules/db/schema';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';

export const userRouter = makeRouter((app) => {
  app.get(
    '/users',
    {
      schema: {
        description: 'List users',
      },
    },
    handle(async () => {
      const users = await db.select().from(usersTable);
      return {
        users,
      };
    }),
  );
});
