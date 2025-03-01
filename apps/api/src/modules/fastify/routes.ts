import type { FastifyInstance } from 'fastify';
import { indexRouter } from '@/routes';
import { userRouter } from '@/routes/users';
import { authCallbackRouter } from '@/routes/auth/callbacks';
import { registerRouter } from '@/routes/auth/registration';
import { authRouter } from '@/routes/auth';

export async function setupRoutes(app: FastifyInstance) {
  await app.register(indexRouter.register);
  await app.register(userRouter.register);
  await app.register(authRouter.register);
  await app.register(authCallbackRouter.register);
  await app.register(registerRouter.register);
}
