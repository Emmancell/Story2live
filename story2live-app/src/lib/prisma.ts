import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any | undefined;
};

function getDbPath(): string {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  // DATABASE_URL format: "file:./dev.db" or "file:/absolute/path/dev.db"
  const relativePath = dbUrl.replace(/^file:/, "");
  if (path.isAbsolute(relativePath)) return relativePath;
  return path.join(process.cwd(), relativePath);
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDbPath() });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Client = PrismaClient as any;
  return new Client({ adapter });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: InstanceType<typeof PrismaClient> =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
