import { mapRegistration } from '@/mappings/registration';
import { mapToken } from '@/mappings/tokens';
import { db } from '@/modules/db';
import { registrations, registrationType, users } from '@/modules/db/schema';
import { makeAuthToken, parseAuthToken } from '@/utils/auth/header';
import { createSession } from '@/utils/auth/session';
import { NotFoundError } from '@/utils/error';
import { handle } from '@/utils/handle';
import { getId } from '@/utils/id';
import { makeRouter } from '@/utils/router';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const registerRouter = makeRouter((app) => {
  app.get(
    '/api/v1/auth/register',
    {
      schema: {
        querystring: z.object({
          token: z.string(),
        }),
      },
    },
    handle(async ({ query }) => {
      const tokenData = parseAuthToken(query.token);
      if (!tokenData || tokenData.type !== 'reg') throw new NotFoundError();
      const [registration] = await db.select().from(registrations).where(eq(registrations.id, tokenData.id));
      if (!registration) throw new NotFoundError();
      return mapRegistration(registration);
    }),
  );

  app.post(
    '/api/v1/auth/register',
    {
      schema: {
        body: z.object({
          token: z.string(),
          username: z.string().min(1),
        }),
      },
    },
    handle(async ({ body }) => {
      const tokenData = parseAuthToken(body.token);
      if (!tokenData || tokenData.type !== 'reg') throw new NotFoundError();
      const [registration] = await db.select().from(registrations).where(eq(registrations.id, tokenData.id));
      if (!registration) throw new NotFoundError();

      const [newUser] = await db.insert(users).values({
        id: getId('usr'),
        securityStamp: '', // empty security stamp to start out with
        username: body.username,
        discordId: registration.type === registrationType.discord ? registration.discordId : null,
      }).returning();
      await db.delete(registrations).where(eq(registrations.id, tokenData.id));
      const [session] = await createSession(newUser);
      return mapToken('auth', makeAuthToken({
        type: 'session',
        id: session.id,
      }));
    }),
  );
});
