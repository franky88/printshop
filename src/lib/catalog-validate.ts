import type { Choice, OptionDef, Product, Tier } from "./catalog";

export class CatalogError extends Error {}

const ID = /^[a-z0-9_-]{1,60}$/;
const r2 = (n: number) => Math.round(n * 100) / 100;

function num(v: unknown, label: string, min: number, max: number, int = false) {
  const n = Number(v);
  if (v === "" || v === null || !Number.isFinite(n) || n < min || n > max || (int && !Number.isInteger(n))) {
    throw new CatalogError(`${label} must be ${int ? "a whole number" : "a number"} from ${min} to ${max}.`);
  }
  return n;
}

function text(v: unknown, label: string, max: number) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new CatalogError(`${label} is required.`);
  if (s.length > max) throw new CatalogError(`${label} must be ${max} characters or fewer.`);
  return s;
}

function idOf(v: unknown) {
  if (typeof v === "string" && ID.test(v)) return v;
  throw new CatalogError("Something went wrong with this form. Reload the page and try again.");
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "product";

type Basics = Pick<Product, "name" | "summary" | "fulfillment">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBasics(raw: any): Basics {
  return {
    name: text(raw?.name, "Name", 60),
    summary: text(raw?.summary, "Short description", 120),
    fulfillment: raw?.fulfillment === "outsourced" ? "outsourced" : "in-house",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseConfig(raw: any, b: Basics & { id: string }): Product {
  const qmin = num(raw?.qty?.min, "Minimum quantity", 1, 10000, true);
  const qstep = num(raw?.qty?.step, "Quantity step", 1, 10000, true);
  const presetsRaw: unknown[] = Array.isArray(raw?.qty?.presets) ? raw.qty.presets : [];
  const presets = [...new Set(presetsRaw.map((x) => num(x, "Each quick quantity", qmin, 10000, true)))].sort((a, c) => a - c);
  if (presets.length < 1 || presets.length > 8) throw new CatalogError("Add 1 to 8 quick quantities, separated by commas.");

  const tiersRaw: unknown[] = Array.isArray(raw?.tiers) ? raw.tiers : [];
  if (tiersRaw.length > 8) throw new CatalogError("Use at most 8 bulk discount rows.");
  const tierMap = new Map<number, number>();
  for (const t of tiersRaw as { min?: unknown; mult?: unknown }[]) {
    const min = num(t?.min, "Bulk discount starting quantity", 1, 10000, true);
    const mult = Number(t?.mult);
    if (!(mult > 0 && mult <= 1)) throw new CatalogError("Bulk discounts must be between 0% and 99%.");
    tierMap.set(min, Math.round(mult * 10000) / 10000);
  }
  if (!tierMap.has(1)) tierMap.set(1, 1);
  const tiers: Tier[] = [...tierMap].map(([min, mult]) => ({ min, mult })).sort((a, c) => a.min - c.min);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const optsRaw: any[] = Array.isArray(raw?.options) ? raw.options : [];
  if (optsRaw.length > 6) throw new CatalogError("Use at most 6 option groups.");
  const seen = new Set<string>();
  const options: OptionDef[] = optsRaw.map((o) => {
    const id = idOf(o?.id);
    if (seen.has(id)) throw new CatalogError("Duplicate option group. Reload the page and try again.");
    seen.add(id);
    const label = text(o?.label, "Option group name", 40);
    const cr: unknown[] = Array.isArray(o?.choices) ? o.choices : [];
    if (cr.length < 1 || cr.length > 12) throw new CatalogError(`"${label}" needs 1 to 12 choices.`);
    const cseen = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const choices: Choice[] = cr.map((c: any) => {
      const cid = idOf(c?.id);
      if (cseen.has(cid)) throw new CatalogError("Duplicate choice. Reload the page and try again.");
      cseen.add(cid);
      const ch: Choice = { id: cid, label: text(c?.label, `Each choice in "${label}"`, 40) };
      if (c?.mult !== undefined) {
        const m = num(c.mult, "A multiplier", 0.01, 1000);
        if (m !== 1) ch.mult = m;
      }
      if (c?.add !== undefined) {
        const a = num(c.add, "An extra price", 0, 100000);
        if (a !== 0) ch.add = r2(a);
      }
      return ch;
    });
    return { id, label, choices };
  });

  return {
    ...b,
    unit: text(raw?.unit, "Unit", 30),
    base: r2(num(raw?.base, "Base price", 0.01, 1000000)),
    setupFee: r2(num(raw?.setupFee ?? 0, "Setup fee", 0, 1000000)),
    minOrder: r2(num(raw?.minOrder ?? 0, "Minimum order", 0, 1000000)),
    qty: { min: qmin, step: qstep, presets },
    tiers,
    options,
  };
}
