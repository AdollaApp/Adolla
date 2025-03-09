import { mapShallowUserForAdmins, mapUserForSelf } from '@/mappings/user';
import { db } from '@/modules/db';
import { users } from '@/modules/db/schema';
import { roles } from '@/utils/auth/roles';
import { handle } from '@/utils/handle';
import { applyPage, mapPage, pagerSchema } from '@/utils/pages';
import { makeRouter } from '@/utils/router';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const userRouter = makeRouter((app) => {
  app.get(
    '/api/v1/stats',
    {
      schema: {
        description: 'Get statistics',
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
    '/api/v1/users',
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

  app.get(
    '/api/v1/users/:uid',
    {
      schema: {
        description: 'Get user',
        params: z.object({
          uid: z.string(),
        }),
      },
    },
    handle(async ({ auth, params }) => {
      const uid = auth.data.resolveUserParam(params.uid);
      auth.check(c => c.isUser(uid));

      const [user] = await db.select().from(users).where(eq(users.id, uid));

      return mapUserForSelf(user);
    }),
  );
});
