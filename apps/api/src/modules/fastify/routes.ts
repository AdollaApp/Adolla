import type { FastifyInstance } from 'fastify';
import { indexRouter } from '@/routes';
import { userRouter } from '@/routes/users';

export async function setupRoutes(app: FastifyInstance) {
  await app.register(indexRouter.register);
  await app.register(userRouter.register);
}
