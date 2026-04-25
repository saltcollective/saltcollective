// @prisma/client/default.js spreads a require() into module.exports, which
// prevents Node.js from statically analyzing named ESM exports. Default import
// + destructure is the only reliable pattern across dev (external CJS) and
// build (Rollup-bundled ESM).
import prismaClientPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = prismaClientPkg;
type Client = InstanceType<typeof PrismaClient>;

function createClient(): Client {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

let _client: Client | undefined;

export const prisma = new Proxy({} as Client, {
  get(_, prop) {
    if (!_client) _client = createClient();
    return _client[prop as keyof Client];
  },
});

export default prisma;
export type * from '@prisma/client';
