import { conf } from '@/config';
import { mapSuccess } from '@/mappings/success';
import { mapToken } from '@/mappings/tokens';
import { db } from '@/modules/db';
import { grantCodes, sessions, users } from '@/modules/db/schema';
import { makeAuthToken } from '@/utils/auth/header';
import { createSession } from '@/utils/auth/session';
import { ApiError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { and, eq, gte } from 'drizzle-orm';
import { z } from 'zod';

export const discordRedirectUrl = new URL(`${conf.server.backendBaseUrl}api/v1/auth/oauth/discord/callback`).toString();

export const authRouter = makeRouter((app) => {
  app.get(
    '/api/v1/auth/oauth/discord',
    {},
    handle(async ({ res }) => {
      const url = new URL('https://discord.com/oauth2/authorize?response_type=code&scope=identify+email');
      url.searchParams.append('client_id', conf.auth.discord.clientId);
      url.searchParams.append('redirect_uri', discordRedirectUrl);
      res.redirect(url.toString(), 307);
    }),
  );

  app.post(
    '/api/v1/auth/login/code',
    {
      schema: {
        body: z.object({
          code: z.string(),
        }),
      },
    },
    handle(async ({ body }) => {
      const [res] = await db.select().from(grantCodes).where(and(eq(grantCodes.token, body.code), gte(grantCodes.expiresAt, new Date()))).leftJoin(users, eq(users.id, grantCodes.userId));
      if (!res || !res.users) throw ApiError.forCode('authInvalidInput');
      await db.delete(grantCodes).where(eq(grantCodes.id, res.grantcodes.id));
      const [session] = await createSession(res.users);
      return mapToken('auth', makeAuthToken({
        type: 'session',
        id: session.id,
      }));
    }),
  );

  app.post(
    '/api/v1/auth/logout',
    {},
    handle(async ({ auth }) => {
      if (auth.checkers.isAuthenticated()) {
        const id = auth.data.getSession().id;
        await db.delete(sessions).where(eq(sessions.id, id));
      }

      return mapSuccess();
    }),
  );
});
