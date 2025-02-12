import {
  setupFastify,
  setupFastifyRoutes,
  startFastify,
} from '@/modules/fastify';
import { logger } from './modules/log';

const log = logger.child({ svc: 'adolla' });

log.info(`App booting...`);

const app = await setupFastify();
await setupFastifyRoutes(app);
await startFastify(app);

log.info(`App setup, ready to accept connections`);
log.info(`--------------------------------------`);
