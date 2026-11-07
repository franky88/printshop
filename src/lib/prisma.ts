import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const VAR = "DATABASE_URL";

// Prisma Postgres needs the prisma+postgres:// URL (the one containing ?api_key=).
// Stray spaces or quotes around the value are removed, and a wrong URL gets a clear error.
function datasourceUrl() {
  const raw = process.env[VAR];
  if (!raw) return undefined;
  const url = raw.trim().replace(/^["']+|["']+$/g, "");
  if (!/^prisma(\+postgres)?:\/\//.test(url)) {
    throw new Error(
      `${VAR} must start with prisma+postgres:// (the Prisma Postgres URL that contains ?api_key=). ` +
        `It currently starts with "${url.slice(0, 11)}". Do not use the direct postgres:// URLs.`,
    );
  }
  return url;
}

// The Accelerate extension adds only caching options we don't use, so the client is typed as a plain
// PrismaClient; that keeps query result types (like `include`) accurate.
const create = () =>
  new PrismaClient({ datasourceUrl: datasourceUrl() }).$extends(withAccelerate()) as unknown as PrismaClient;

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
