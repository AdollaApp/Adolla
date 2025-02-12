import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'adolla-client',
  entry: ['src/main.ts'],
  format: 'esm',
});
