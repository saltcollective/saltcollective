import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  plugins: [sveltekit()],
  ssr: {
    // In dev, packages are external so Node.js handles CJS natively.
    // In build, bundle the generated Prisma CJS client so Rollup converts it
    // to ESM — Deno's build runner rejects bare CJS `module` globals.
    noExternal: command === 'build' ? ['@prisma/client', '.prisma'] : [],
  },
}));
