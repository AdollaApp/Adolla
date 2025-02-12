import { conf } from '@/config';
import { drizzle } from 'drizzle-orm/node-postgres';

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: conf.database.connection,
    ssl: conf.database.ssl
  }
});

export async function isDatabaseConnected() {
  try {
    await db.execute(`select 1`)
    return true;
  } catch {
    return false;
  }
}
