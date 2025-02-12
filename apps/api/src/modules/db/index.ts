import { conf } from '@/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { logger } from '../log';

export const db = drizzle({
  connection: {
    connectionString: conf.database.connection,
    ssl: conf.database.ssl,
  },
});

export async function isDatabaseConnected() {
  try {
    await db.execute(`select 1`);
    return true;
  } catch (err) {
    logger.warn(err);
    return false;
  }
}
