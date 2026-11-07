import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { products as DEFAULTS, type Product } from "./catalog";

type Row = { id: string; name: string; summary: string; fulfillment: string; config: unknown };

export function rowToProduct(r: Row): Product {
  const c = (r.config ?? {}) as Partial<Product>;
  return {
    id: r.id,
    name: r.name,
    summary: r.summary,
    fulfillment: r.fulfillment === "OUTSOURCED" ? "outsourced" : "in-house",
    unit: c.unit ?? "piece",
    base: c.base ?? 0,
    setupFee: c.setupFee ?? 0,
    minOrder: c.minOrder ?? 0,
    qty: c.qty ?? { min: 1, step: 1, presets: [1] },
    tiers: c.tiers ?? [{ min: 1, mult: 1 }],
    options: c.options ?? [],
  };
}

export function productToData(p: Product) {
  return {
    name: p.name,
    summary: p.summary,
    fulfillment: p.fulfillment === "in-house" ? ("IN_HOUSE" as const) : ("OUTSOURCED" as const),
    config: {
      unit: p.unit,
      base: p.base,
      setupFee: p.setupFee,
      minOrder: p.minOrder,
      qty: p.qty,
      tiers: p.tiers,
      options: p.options,
    } as unknown as Prisma.InputJsonValue,
  };
}

let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: DEFAULTS.map((p, i) => ({ id: p.id, ...productToData(p), sortOrder: i })),
      skipDuplicates: true,
    });
  }
  seeded = true;
}

// Products customers can order. Without a database (local preview only), the built-in defaults are used.
export async function getCatalog(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return DEFAULTS;
  await ensureSeeded();
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(rowToProduct);
}

// Every product, including hidden ones, for the admin.
export async function getAllProductRows() {
  await ensureSeeded();
  return prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}
