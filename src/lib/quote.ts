import type { Product } from "./catalog";

export type Selection = Record<string, string>;
export type Line = { label: string; amount: number };
export type Quote = {
  productId: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  chosen: { option: string; choice: string }[];
  lines: Line[];
  total: number;
};

export class QuoteError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function defaultSelection(p: Product): Selection {
  return Object.fromEntries(p.options.map((o) => [o.id, o.choices[0].id]));
}

export function peso(n: number): string {
  return "₱" + n.toLocaleString("en-PH", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

// Pure function: the browser uses it for live quotes and the server
// re-runs it at checkout, so the client can never set its own price.
export function quote(p: Product | undefined, selection: Selection, qty: number): Quote {
  if (!p) throw new QuoteError("That product isn't available.");
  if (!Number.isInteger(qty) || qty < p.qty.min || qty > 10000) {
    throw new QuoteError(`Quantity must be a whole number from ${p.qty.min} to 10,000.`);
  }

  let mult = 1;
  let add = 0;
  const chosen: Quote["chosen"] = [];
  for (const o of p.options) {
    const c = o.choices.find((c) => c.id === selection?.[o.id]);
    if (!c) throw new QuoteError(`Choose a valid option for ${o.label}.`);
    mult *= c.mult ?? 1;
    add += c.add ?? 0;
    chosen.push({ option: o.label, choice: c.label });
  }

  const tier = [...p.tiers].reverse().find((t) => qty >= t.min) ?? p.tiers[0];
  const unitPrice = round2((p.base * mult + add) * tier.mult);
  const items = round2(unitPrice * qty);

  const lines: Line[] = [{ label: `${qty} × ${peso(unitPrice)} per ${p.unit}`, amount: items }];
  let total = items;
  if (p.setupFee > 0) {
    lines.push({ label: "Layout and setup", amount: p.setupFee });
    total += p.setupFee;
  }
  if (total < p.minOrder) {
    lines.push({ label: `Adjustment to ${peso(p.minOrder)} minimum order`, amount: round2(p.minOrder - total) });
    total = p.minOrder;
  }

  return {
    productId: p.id,
    qty,
    unitPrice,
    discountPct: Math.round((1 - tier.mult) * 100),
    chosen,
    lines,
    total: round2(total),
  };
}

export function describeSelection(p: Product | undefined, selection: Selection): string {
  if (!p) return "";
  return p.options
    .map((o) => o.choices.find((c) => c.id === selection?.[o.id])?.label)
    .filter(Boolean)
    .join(", ");
}
