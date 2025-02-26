import { conf } from '@/config';
import { db } from '@/modules/db';
import { sessions } from '@/modules/db/schema';
import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { eq } from 'drizzle-orm';

export const discordRedirectUrl = new URL(`${conf.server.backendBaseUrl}api/v1/auth/oauth/discord/callback`).toString();

// TODO exchange grant code for login
// TODO get registration from token
// TODO complete registration with token
// TODO test all of this auth flow shit

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
