import { mapShallowUserForAdmins } from '@/mappings/user';
import { db } from '@/modules/db';
import { users } from '@/modules/db/schema';
import { roles } from '@/utils/auth/roles';
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
    handle(async ({ auth }) => {
      auth.check(c => c.hasRole(roles.super));
      const userQuery = await db.select().from(users);
      // TODO pagination
      return userQuery.map(mapShallowUserForAdmins);
    }),
  );
});
