import { mapShallowUserForAdmins } from '@/mappings/user';
import { db } from '@/modules/db';
import { users } from '@/modules/db/schema';
import { roles } from '@/utils/auth/roles';
import { handle } from '@/utils/handle';
import { applyPage, mapPage, pagerSchema } from '@/utils/pages';
import { makeRouter } from '@/utils/router';

export const userRouter = makeRouter((app) => {
  app.get(
    '/stats',
    {
      schema: {
        description: 'Get statistics',
        querystring: pagerSchema(),
      },
    },
    handle(async ({ auth }) => {
      auth.check(c => c.hasRole(roles.super));
      const totalUsers = await db.$count(db.select().from(users));
      return {
        userTotal: totalUsers,
      };
    }),
  );

  app.get(
    '/users',
    {
      schema: {
        description: 'List users',
        querystring: pagerSchema(),
      },
    },
    handle(async ({ auth, query }) => {
      auth.check(c => c.hasRole(roles.super));
      const baseQuery = db.select().from(users);
      const usrQuery = await applyPage(baseQuery, query);
      const total = await db.$count(baseQuery);
      return mapPage(query, usrQuery.map(mapShallowUserForAdmins), total);
    }),
  );
});
