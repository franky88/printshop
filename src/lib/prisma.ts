import { PrismaClient } from "@prisma/client";

const VAR = "DATABASE_URL";

// Uses the direct Postgres connection string (starts with postgres://).
// Stray spaces or quotes around the value are removed, and a wrong URL gets a clear error.
function datasourceUrl() {
  const raw = process.env[VAR];
  if (!raw) return undefined;
  const url = raw.trim().replace(/^["']+|["']+$/g, "");
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error(
      `${VAR} must start with postgres:// (the direct connection string). ` +
        `It currently starts with "${url.slice(0, 11)}". Do not use the prisma+postgres:// URL.`,
    );
  }
  return url;
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ datasourceUrl: datasourceUrl() });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
