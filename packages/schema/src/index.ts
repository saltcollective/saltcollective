import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;

type Client = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: Client | undefined };

function createPrismaClient(): Client {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = new Proxy({} as Client, {
  get(_, prop) {
    globalForPrisma.prisma ??= createPrismaClient();
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});

export default prisma;
export type * from '@prisma/client';
