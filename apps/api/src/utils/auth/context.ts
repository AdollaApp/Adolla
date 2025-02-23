import type { FastifyRequest } from 'fastify';
import type { Roles } from './roles';
import { roles } from './roles';
import { ApiError } from '../error';
import { hasAuthorizationToken, parseAuthToken } from './header';
import type { PopulatedSession } from './session';
import { fetchSessionAndUpdateExpiry } from './session';

export interface AuthChecks {
  isAuthenticated(): boolean;
  hasRole(role: Roles): boolean;
}

export interface AuthContext {
  check(cb: (checks: AuthChecks) => boolean): void;
  checkers: AuthChecks;
  data: {
    getSession(): PopulatedSession;
    getUserId(): string;
    getRoles(): Roles[];
  };
}

export interface AuthContextData {
  session?: PopulatedSession;
}

export async function fetchAuthContextData(
  req: FastifyRequest,
  token: string | undefined = undefined,
): Promise<AuthContextData> {
  const jwt = token ?? hasAuthorizationToken(req);
  if (!jwt) return {};
  const payload = parseAuthToken(jwt);
  if (!payload) throw ApiError.forCode('authInvalidToken');

  if (payload?.type === 'session') {
    const session = await fetchSessionAndUpdateExpiry(payload.id);
    if (!session) {
      throw ApiError.forCode('authInvalidToken');
    }
    return {
      session,
    };
  }

  return {};
}

function processAuthContextData(data: AuthContextData) {
  const userId = data.session?.user?.id;
  const userRoles = data.session?.user?.roles ?? [];
  userRoles.push(roles.user);

  return {
    userId,
    roles: userRoles,
  };
}

export function makeAuthCheckers(data: AuthContextData): AuthChecks {
  const context = processAuthContextData(data);

  return {
    hasRole(role: Roles) {
      return context.roles.includes(role);
    },
    isAuthenticated() {
      return !!data.session;
    },
  };
}

export async function makeAuthContext(
  req: FastifyRequest,
  token: string | undefined = undefined,
): Promise<AuthContext> {
  const data = await fetchAuthContextData(req, token);
  const checkers = makeAuthCheckers(data);

  return {
    check(cb) {
      const result = cb(checkers);
      if (!result) throw ApiError.forCode('authMissingPermissions');
    },
    checkers,
    data: {
      getSession() {
        if (!data.session) throw new Error('Session not set but is requested');
        return data.session;
      },
      getRoles() {
        return (this.getSession().user?.roles ?? []) as Roles[];
      },
      getUserId() {
        return this.getSession().userId;
      },
    },
  };
}
