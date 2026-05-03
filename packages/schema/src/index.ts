import process from 'node:process';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { withAccelerate } from '@prisma/extension-accelerate';

function createPrismaClient() {
  const datasourceUrl = process.env.PRISMA_URL;
  if (!datasourceUrl) throw new Error('PRISMA_URL is not set');
  return new PrismaClient({ datasourceUrl }).$extends(withAccelerate());
}

type ExtendedClient = ReturnType<typeof createPrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma: ExtendedClient | undefined };

export const prisma = new Proxy({} as ExtendedClient, {
  get(_, prop) {
    globalForPrisma.prisma ??= createPrismaClient();
    return Reflect.get(globalForPrisma.prisma as object, prop);
  },
});

export default prisma;
export type * from '@prisma/client';
