import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'adolla-api',
  entry: ['src/main.ts'],
  format: 'esm',
});
