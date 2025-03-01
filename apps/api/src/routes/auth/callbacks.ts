import { handle } from '@/utils/handle';
import { makeRouter } from '@/utils/router';
import { ofetch } from 'ofetch';
import { z } from 'zod';
import { discordRedirectUrl } from '.';
import { db } from '@/modules/db';
import { registrations, registrationType, users } from '@/modules/db/schema';
import { getId } from '@/utils/id';
import { eq } from 'drizzle-orm';
import { createAfterLoginUrl, createRegisterCompletionUrl } from '@/utils/auth/urls';
import { conf } from '@/config';

type DiscordTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
};

type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
  verified?: boolean;
  global_name?: string;
};

export const authCallbackRouter = makeRouter((app) => {
  app.get(
    '/api/v1/auth/oauth/discord/callback',
    {
      schema: {
        querystring: z.object({
          code: z.string(),
        }),
      },
    },
    handle(async ({ query, res }) => {
      const tokenResponse = await ofetch<DiscordTokenResponse>('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: discordRedirectUrl,
          client_id: conf.auth.discord.clientId,
          client_secret: conf.auth.discord.clientSecret,
        }),
      });

      const user = await ofetch<DiscordUser>('https://discord.com/api/v10/users/@me', {
        headers: new Headers({
          authorization: 'Bearer ' + tokenResponse.access_token,
        }),
      });
      const [existingUser] = await db.select().from(users).where(eq(users.discordId, user.id));
      if (existingUser) {
        res.redirect(await createAfterLoginUrl(existingUser.id), 307);
        return res;
      }

      const [registration] = await db.insert(registrations).values({
        id: getId('reg'),
        type: registrationType.discord,
        discordId: user.id,
        usernameSuggestion: user.global_name ?? user.username,
      }).returning();
      res.redirect(createRegisterCompletionUrl(registration.id), 307);
      return res;
    }),
  );
});
