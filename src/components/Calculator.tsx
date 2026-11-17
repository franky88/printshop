"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { defaultSelection, peso, quote } from "@/lib/quote";

const pill = (on: boolean) =>
  `min-h-11 rounded-xl border px-4 text-base font-bold transition-colors ${
    on ? "border-teal bg-teal text-white" : "border-ink/50 bg-paper hover:border-teal hover:bg-teal/5"
  }`;

export default function Calculator({ catalog }: { catalog: Product[] }) {
  if (catalog.length === 0) {
    return <p className="surface mt-8 rounded-2xl p-6 text-ink/75">Prices aren&rsquo;t available right now. <Link href="/custom-quote" className="font-bold text-teal underline underline-offset-4">Request a custom quote</Link> and we&rsquo;ll help you find a price.</p>;
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
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="surface min-w-0 space-y-8 rounded-2xl p-5 sm:p-7">
        <fieldset>
          <legend className="mb-4 font-display text-lg font-black">What are you printing?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {catalog.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === product.id}
                onClick={() => pick(p)}
                className={`min-h-20 rounded-xl border px-4 py-3 text-left transition-colors ${
                  p.id === product.id ? "border-teal bg-teal/5 ring-1 ring-teal" : "border-ink/25 bg-paper hover:border-teal hover:bg-teal/5"
                }`}
              >
                <span className="flex items-start justify-between gap-2 font-display text-base font-bold">{p.name}<span aria-hidden="true" className={p.id === product.id ? "text-teal" : "invisible"}>✓</span></span>
                <span className="mt-0.5 block text-sm text-ink/75">
                  {p.summary}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {product.options.map((o) => (
          <fieldset key={o.id}>
            <legend className="mb-3 font-display text-base font-black">{o.label}</legend>
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
          <legend className="mb-3 font-display text-base font-black">How many {product.unit}s?</legend>
          <div className="flex flex-wrap items-center gap-2">
            {product.qty.presets.map((n) => (
              <button key={n} type="button" aria-pressed={qty === n} onClick={() => setQty(n)} className={pill(qty === n)}>
                {n}
              </button>
            ))}
            <label className="flex items-center gap-2 text-base">
              <span className="text-ink/70">Other</span>
              <input
                type="number"
                inputMode="numeric"
                min={product.qty.min}
                step={product.qty.step}
                value={qty || ""}
                onChange={(e) => setQty(Number(e.target.value))}
                className="min-h-11 w-24 rounded-xl border border-ink/50 bg-paper px-3"
              />
            </label>
          </div>
        </fieldset>
      </div>

      <aside aria-label="Your live quote" aria-live="polite" aria-atomic="true" className="surface overflow-hidden rounded-2xl lg:sticky lg:top-28">
        <div className="bg-ink px-6 py-5 text-white">
          <p className="text-xs font-bold tracking-widest text-white/75 uppercase">Your live quote</p>
          <h3 className="mt-1 font-display text-xl font-black">{product.name}</h3>
        </div>
        <div className="p-6">
          {result ? (
            <>
              <dl className="mt-4 space-y-1 text-sm">
                {result.chosen.map((s) => (
                  <div key={s.option} className="flex justify-between gap-4">
                    <dt className="text-ink/75">{s.option}</dt>
                    <dd className="font-bold">{s.choice}</dd>
                  </div>
                ))}
              </dl>
              <hr className="my-5 border-ink/15" />
              <ul className="space-y-1.5 text-sm tabular-nums">
                {result.lines.map((l) => (
                  <li key={l.label} className="flex justify-between gap-4">
                    <span>{l.label}</span>
                    <span>{peso(l.amount)}</span>
                  </li>
                ))}
              </ul>
              {result.discountPct > 0 && (
                <p className="mt-4 rounded-lg bg-teal/5 p-3 text-sm font-bold text-teal">
                  Bulk price applied: {result.discountPct}% off each {product.unit}.
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-ink/15 pt-5">
                <span className="text-sm text-ink/75">Total</span>
                <span className="font-display text-4xl font-black tracking-tight tabular-nums">
                  {peso(result.total)}
                </span>
              </div>
              <button
                type="button"
                onClick={addToOrder}
                disabled={added}
                className="button-primary mt-6 w-full disabled:cursor-default"
              >
                {added ? "Added to your order" : "Add to order"}
              </button>
              <p className="mt-3 text-sm text-ink/70">Upload your file and choose pickup or delivery in your order.</p>
              {added && (
                <p className="mt-3 text-sm">
                  <Link href="/cart" className="font-bold text-teal underline underline-offset-4">
                    Review your order ({cart.items.length})
                  </Link>{" "}
                  or change the options to add another item.
                </p>
              )}
            </>
          ) : (
            <p role="status" className="rounded-xl bg-gold/20 p-4 text-base">
              Enter a whole number of {product.unit}s, at least {product.qty.min}, to see your price.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
