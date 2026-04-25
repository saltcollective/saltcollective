import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@saltcollective/ui': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
      '@saltcollective/schema': fileURLToPath(
        new URL('../../packages/schema/src', import.meta.url)
      ),
    },
  },
});
