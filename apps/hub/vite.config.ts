import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    external: ['@prisma/client', '@prisma/extension-accelerate'],
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', '@prisma/extension-accelerate'],
    },
  },
});
