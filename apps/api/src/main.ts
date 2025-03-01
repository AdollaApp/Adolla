import {
  setupFastify,
  setupFastifyRoutes,
  startFastify,
} from '@/modules/fastify';
import { logDivide, logger, logIntro } from './modules/log';
import { createProgram } from './cli';

async function run() {
  const log = logger.child({ svc: 'adolla' });

  logIntro();
  log.info(`App booting...`);

  const app = await setupFastify();
  await setupFastifyRoutes(app);
  await startFastify(app);

  log.info(`App setup, ready to accept connections`);
  logDivide();
}

const program = createProgram(run);
await program.parseAsync(process.argv);
