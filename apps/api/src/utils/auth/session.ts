import { db } from '@/modules/db';
import type { Session, User } from '@/modules/db/schema';
import { sessions, users } from '@/modules/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { eq, gte, and } from 'drizzle-orm';
import { getId } from '../id';
import { makeAuthToken } from './header';

const expiryInMs = 30 * 24 * 60 * 60 * 1000; // 7 days

export type PopulatedSession = Session & {
  user: User;
};

export async function fetchSessionAndUpdateExpiry(
  id: string,
): Promise<PopulatedSession | null> {
  try {
    const [newSession] = await db.update(sessions).set({
      expiresAt: new Date(Date.now() + expiryInMs), // new expiry date = NOW + expiry delay
    }).where(and(eq(sessions.id, id), gte(sessions.expiresAt, new Date()))).returning();
    if (!newSession) return null;
    const [user] = await db.selectDistinct().from(users).where(
      eq(users.id, newSession.userId),
    );
    if (!user) return null;
    // security stamp doesn't match, session invalid
    if (newSession.securityStamp !== user.securityStamp) return null;

    const populatedSession: PopulatedSession = {
      ...newSession,
      user,
    };
    return populatedSession;
  } catch {
    return null;
  }
}

export async function createSession(user: InferSelectModel<typeof users>) {
  return await db.insert(sessions).values({
    expiresAt: new Date(Date.now() + expiryInMs), // new expiry date = NOW + expiry delay
    userId: user.id,
    securityStamp: user.securityStamp,
    id: getId('ses'),
  }).returning();
}

export function makeSessionToken(id: string): string {
  return makeAuthToken({
    type: 'session',
    id,
  });
}
