import { db } from '@/modules/db';
import { sessions } from '@/modules/db/schema';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { eq } from 'drizzle-orm';

export const authRouter = makeRouter((app) => {
  app.post(
    '/api/v1/auth/logout',
    {},
    handle(async ({ auth }) => {
      auth.check(c => c.isAuthenticated());
      const id = auth.data.getSession().id;

      await db.delete(sessions).where(eq(sessions.id, id));
      return {
        success: true,
      };
    }),
  );
});
