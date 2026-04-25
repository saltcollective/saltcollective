import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '@saltcollective/ui': '../../packages/ui/src',
      '@saltcollective/schema': '../../packages/schema/src',
    },
  },
};
