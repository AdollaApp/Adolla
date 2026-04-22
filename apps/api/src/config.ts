import { zodCoercedBoolean } from '@neato/config';
import { createConfigLoader } from '@neato/config';
import type { PartialDeep } from 'type-fest';
import { z } from 'zod';

const schema = z.object({
  server: z
    .object({
      port: z.coerce.number().default(8080),
      cors: z.string().default(''),
      basePath: z.string().default('/'),
      backendBaseUrl: z.string().url().endsWith('/'),
      frontendBaseUrl: z.string().url().endsWith('/'),
    }),
  auth: z
    .object({
      discord: z
        .object({
          clientId: z.string(),
          clientSecret: z.string(),
        }),
    }),
  logging: z
    .object({
      format: z.enum(['json', 'pretty']).default('pretty'),
      debug: zodCoercedBoolean().default(false),
      silenceNoisyLogs: zodCoercedBoolean().default(false),
    })
    .default({}),
  crypto: z.object({
    secret: z.string().min(32),
  }),
  database: z.object({
    connection: z.string(),
    ssl: zodCoercedBoolean().default(false),
  }),
});

export const fragments: Record<string, PartialDeep<z.infer<typeof schema>>> = {
  docker: {
    server: {
      cors: 'http://192.168.1.150:3000 http://192.168.1.150:5173',
      frontendBaseUrl: 'http://192.168.1.150:5173/',
      backendBaseUrl: 'http://192.168.1.150:8080/',
    },
    database: {
      connection: 'postgres://postgres:postgres@localhost:5432/postgres',
    },
    crypto: {
      secret: '12345678901234567890123456789012',
    },
  },
  dockerprod: {
    server: {
      cors: 'http://192.168.1.150:3000 http://192.168.1.150:5173 https://adolla.app',
      frontendBaseUrl: 'https://adolla.app/',
      backendBaseUrl: 'https://api.adolla.app/',
    },
    database: {
      connection: 'postgres://postgres:postgres@localhost:5432/postgres',
    },
    crypto: {
      secret: '12345678901234567890123456789012H',
    },
  },
};

// TODO get version not from env but from package.json file
export const version = process.env.npm_package_version ?? 'unknown';

export const conf = createConfigLoader()
  .addFromEnvironment('CONF_')
  .addFromFile('.env', { prefix: 'CONF_' })
  .addZodSchema(schema)
  .addConfigFragments(fragments)
  .setFragmentKey('USE_PRESETS')
  .load();
