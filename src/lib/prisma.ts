import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Prisma Postgres connects through a prisma+postgres:// URL, which needs the Accelerate extension.
// The extension adds only caching options we don't use, so the client is typed as a plain PrismaClient;
// that keeps query result types (like `include`) accurate.
const create = () => new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient;

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
