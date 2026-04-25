import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const createDb = () => new PrismaClient().$extends(withAccelerate());

export type DbClient = ReturnType<typeof createDb>;

export * from '@prisma/client';
