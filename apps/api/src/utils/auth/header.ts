import type { SignOptions } from 'jsonwebtoken';
import { verify, sign } from 'jsonwebtoken';
import type { FastifyRequest } from 'fastify';
import { ApiError } from '@/utils/error';
import { logger } from '@/modules/log';
import { conf } from '@/config';

export type AuthToken = {
  type: 'session';
  id: string;
};

const alg = 'HS256' as const;

export function parseAuthToken(input: string): null | AuthToken {
  try {
    const jwt = verify(input, conf.crypto.secret, {
      algorithms: [alg],
      complete: true,
    });
    if (typeof jwt.payload === 'string') return null;
    return jwt.payload as AuthToken;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

export function makeAuthToken(
  payload: AuthToken,
): string {
  const ops: SignOptions = {
    algorithm: alg,
  };
  return sign(payload, conf.crypto.secret, ops);
}

export function hasAuthorizationToken(request: FastifyRequest) {
  const { authorization } = request.headers;
  if (!authorization) return null;
  const headerParts: string[] = authorization.split(' ', 2);
  if (headerParts.length == 0 || headerParts[0] !== 'Bearer')
    throw ApiError.forCode('authInvalidInput');
  return headerParts[1];
}

export function getAuthorizationToken(request: FastifyRequest) {
  const token = hasAuthorizationToken(request);
  if (!token) throw ApiError.forCode('authInvalidInput');
  return token;
}
