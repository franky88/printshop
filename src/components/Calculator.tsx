"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { defaultSelection, peso, quote } from "@/lib/quote";
import InkField from "./InkField";

const pill = (on: boolean) =>
  `min-h-11 rounded-full border-2 px-5 text-sm font-medium transition-colors ${
    on ? "border-cyan-ink bg-cyan-ink text-white" : "border-ink/15 bg-paper hover:border-ink"
  }`;

export default function Calculator({ catalog }: { catalog: Product[] }) {
  if (catalog.length === 0) {
    return <p className="mt-10 text-ink/70">Prices aren&rsquo;t available right now. Please check back soon.</p>;
  }
  return <CalculatorInner catalog={catalog} />;
}

function CalculatorInner({ catalog }: { catalog: Product[] }) {
  const [product, setProduct] = useState<Product>(catalog[0]);
  const [selection, setSelection] = useState(() => defaultSelection(catalog[0]));
  const [qty, setQty] = useState(catalog[0].qty.presets[0]);
  const cart = useCart();
  const [addedKey, setAddedKey] = useState("");
  const key = `${product.id}|${JSON.stringify(selection)}|${qty}`;
  const added = addedKey === key;

  function addToOrder() {
    cart.add({ productId: product.id, selection, qty });
    setAddedKey(key);
  }

  function pick(p: Product) {
    setProduct(p);
    setSelection(defaultSelection(p));
    setQty(p.qty.presets[0]);
  }

  const result = useMemo(() => {
    try {
      return quote(product, selection, qty);
    } catch {
      return null;
    }
  }, [product, selection, qty]);

  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_400px]">
      <div className="space-y-9">
        <fieldset>
          <legend className="mb-3 font-display text-base font-semibold">What are you printing?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {catalog.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === product.id}
                onClick={() => pick(p)}
                className={`min-h-16 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                  p.id === product.id ? "border-ink bg-ink text-white" : "border-ink/15 bg-paper hover:border-ink"
                }`}
              >
                <span className="block font-display text-sm font-semibold">{p.name}</span>
                <span className={`mt-0.5 block text-sm ${p.id === product.id ? "text-white/80" : "text-ink/70"}`}>
                  {p.summary}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {product.options.map((o) => (
          <fieldset key={o.id}>
            <legend className="mb-3 font-display text-base font-semibold">{o.label}</legend>
            <div className="flex flex-wrap gap-2">
              {o.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selection[o.id] === c.id}
                  onClick={() => setSelection({ ...selection, [o.id]: c.id })}
                  className={pill(selection[o.id] === c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset>
          <legend className="mb-3 font-display text-base font-semibold">How many {product.unit}s?</legend>
          <div className="flex flex-wrap items-center gap-2">
            {product.qty.presets.map((n) => (
              <button key={n} type="button" aria-pressed={qty === n} onClick={() => setQty(n)} className={pill(qty === n)}>
                {n}
              </button>
            ))}
            <label className="ml-1 flex items-center gap-2 text-sm">
              <span className="text-ink/70">Other</span>
              <input
                type="number"
                inputMode="numeric"
                min={product.qty.min}
                step={product.qty.step}
                value={qty || ""}
                onChange={(e) => setQty(Number(e.target.value))}
                className="min-h-11 w-28 rounded-full border-2 border-ink/15 bg-paper px-4"
              />
            </label>
          </div>
        </fieldset>
      </div>

      <aside aria-live="polite" className="relative lg:sticky lg:top-24 lg:self-start">
        <InkField />
        <div className="glass relative z-10 rounded-[1.75rem] p-6">
          <p className="font-display text-lg font-semibold">{product.name}</p>
          {result ? (
            <>
              <dl className="mt-4 space-y-1 text-sm">
                {result.chosen.map((s) => (
                  <div key={s.option} className="flex justify-between gap-4">
                    <dt className="text-ink/75">{s.option}</dt>
                    <dd className="font-medium">{s.choice}</dd>
                  </div>
                ))}
              </dl>
              <hr className="my-4 border-dashed border-ink/30" />
              <ul className="space-y-1.5 text-sm tabular-nums">
                {result.lines.map((l) => (
                  <li key={l.label} className="flex justify-between gap-4">
                    <span>{l.label}</span>
                    <span>{peso(l.amount)}</span>
                  </li>
                ))}
              </ul>
              {result.discountPct > 0 && (
                <p className="mt-3 text-sm font-medium">
                  Bulk price applied: {result.discountPct}% off each {product.unit}.
                </p>
              )}
              <div className="mt-6 flex items-end justify-between gap-3">
                <span className="text-sm text-ink/75">Total</span>
                <span className="bg-[linear-gradient(transparent_62%,var(--color-yolk)_62%)] px-1 font-display text-3xl font-bold tabular-nums">
                  {peso(result.total)}
                </span>
              </div>
              <button
                type="button"
                onClick={addToOrder}
                disabled={added}
                className="mt-6 min-h-12 w-full rounded-full bg-ink px-6 font-semibold text-white transition-colors hover:bg-cyan-ink disabled:bg-ink/40"
              >
                {added ? "Added to your order" : "Add to order"}
              </button>
              {added && (
                <p className="mt-3 text-sm">
                  <Link href="/cart" className="font-semibold text-cyan-ink underline underline-offset-4">
                    Review your order ({cart.items.length})
                  </Link>{" "}
                  or change the options to add another item.
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm">
              Enter a whole number of {product.unit}s, at least {product.qty.min}, to see your price.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
