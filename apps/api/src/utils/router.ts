import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
} from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export type Instance = FastifyInstance<
  RawServerBase,
  RawRequestDefaultExpression<RawServerBase>,
  RawReplyDefaultExpression<RawServerBase>,
  FastifyBaseLogger,
  ZodTypeProvider
>;
export type RegisterPlugin = FastifyPluginAsync<
  Record<never, never>,
  RawServerBase,
  ZodTypeProvider
>;

export function makeRouter(cb: (app: Instance) => void): {
  register: RegisterPlugin;
} {
  return {
    register: async (app) => {
      cb(app);
    },
  };
}
