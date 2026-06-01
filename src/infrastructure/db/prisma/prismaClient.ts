import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type PrismaGlobal = typeof globalThis & {
  jimBoatsPrismaClient?: PrismaClient;
};

const prismaGlobal = globalThis as PrismaGlobal;

export function getPrismaClient() {
  prismaGlobal.jimBoatsPrismaClient ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: resolveDatabaseUrl(),
    }),
  });

  return prismaGlobal.jimBoatsPrismaClient;
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error("DATABASE_URL is required to initialize Prisma Client.");
}
