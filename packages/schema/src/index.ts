import process from 'node:process';

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function getEnv(key: string): string | undefined {
  // Works in both Deno and Node.js (Vite/SvelteKit)
  if (typeof (globalThis as unknown as { Deno?: { env: { get(k: string): string | undefined } } }).Deno !== 'undefined') {
    return (globalThis as unknown as { Deno: { env: { get(k: string): string | undefined } } }).Deno.env.get(key);
  }
  if (typeof process !== 'undefined') return process.env[key];
  return undefined;
}

function createPrismaClient(): InstanceType<typeof PrismaClient> {
  const connectionString = getEnv('DATABASE_URL');

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter, log: ['error'] });
}

function getPrismaClient(): InstanceType<typeof PrismaClient> {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});

export default prisma;
export * from '@prisma/client';
