import { PrismaClient } from "@/generated/prisma";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL!;
const adapter = url.includes("neon.tech")
  ? new PrismaNeonHttp(url, { arrayMode: false, fullResults: false })
  : new PrismaPg({ connectionString: url });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
