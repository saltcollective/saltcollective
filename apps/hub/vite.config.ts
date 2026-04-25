import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    // Prisma and pg use CJS internally. Bundling them with Rollup converts
    // CJS → ESM so Deno Deploy's build runner can process them.
    noExternal: ['@prisma/client', '.prisma', '@prisma/adapter-pg', 'pg'],
  },
  resolve: {
    alias: {
      '@saltcollective/ui': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
      '@saltcollective/schema': fileURLToPath(
        new URL('../../packages/schema/src', import.meta.url)
      ),
    },
  },
});
