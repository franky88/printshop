import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Prisma Postgres connects through a prisma+postgres:// URL, which needs the Accelerate extension.
const create = () => new PrismaClient().$extends(withAccelerate());

const g = globalThis as unknown as { prisma?: ReturnType<typeof create> };
export const prisma = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
