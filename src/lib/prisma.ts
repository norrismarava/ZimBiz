import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL!;
// Neon URLs default to the WebSocket adapter (works when 5432 is blocked,
// e.g. this dev machine's ISP). Set DB_DRIVER=pg on hosts that can reach
// 5432 directly (Render) — plain TCP is the most stable path there.
const adapter =
  url.includes("neon.tech") && process.env.DB_DRIVER !== "pg"
    ? new PrismaNeon({ connectionString: url })
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
