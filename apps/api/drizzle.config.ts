import { conf } from '@/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/modules/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: conf.database.connection,
    ssl: conf.database.ssl,
  },
});
