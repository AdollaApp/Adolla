import { conf } from '@/config';
import { makeAuthToken } from './header';
import { grantCodes } from '@/modules/db/schema';
import { getId } from '../id';
import { db } from '@/modules/db';
import { randomBytes } from 'crypto';

const registrationStartUrl = new URL(`${conf.server.frontendBaseUrl}register/setup`).toString();
const afterLoginUrl = new URL(`${conf.server.frontendBaseUrl}login/callback`).toString();

export async function createAfterLoginUrl(userId: string) {
  const [grantCode] = await db.insert(grantCodes).values({
    id: getId('reg'),
    userId: userId,
    token: randomBytes(8).toString('hex'),
  }).returning();
  const afterLoginRedirect = new URL(afterLoginUrl);
  afterLoginRedirect.searchParams.append('code', grantCode.token);
  return afterLoginRedirect.toString();
}

export function createRegisterCompletionUrl(regId: string) {
  const registrationRedirect = new URL(registrationStartUrl);
  registrationRedirect.searchParams.append('token', makeAuthToken({
    id: regId,
    type: 'reg',
  }));
  return registrationRedirect.toString();
}
