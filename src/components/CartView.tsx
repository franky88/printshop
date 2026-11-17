"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { shop } from "@/config";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { peso, quote, describeSelection } from "@/lib/quote";
import FileUpload from "./FileUpload";

const field = "min-h-11 w-full rounded-lg border border-ink/50 bg-paper px-3 py-2";

export default function CartView({ catalog }: { catalog: Product[] }) {
  const byId = (id: string) => catalog.find((p) => p.id === id);
  const { items, ready, update, remove, clear } = useCart();
  const router = useRouter();
  const [delivery, setDelivery] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <div className="surface mt-8 rounded-2xl p-8 sm:p-12">
        <h2 className="text-2xl font-black">Your next print starts here.</h2>
        <p className="mt-3 max-w-prose text-ink/75">Your order is empty. Choose a product and see your price before adding it to your order.</p>
        <Link href="/#price" className="button-primary mt-6">
          Find your print
        </Link>
      </div>
    );
  }

  const priced = items.map((it) => {
    try {
      return { it, q: quote(byId(it.productId), it.selection, it.qty) };
    } catch {
      return { it, q: null };
    }
  });
  const subtotal = priced.reduce((s, p) => s + (p.q?.total ?? 0), 0);
  const fee = delivery === "DELIVERY" ? shop.deliveryFee : 0;
  const invalid = priced.some((p) => !p.q);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: f.get("customer"),
          email: f.get("email"),
          phone: f.get("phone"),
          delivery,
          address: f.get("address"),
          notes: f.get("notes"),
          items: items.map(({ productId, selection, qty, files }) => ({ productId, selection, qty, files })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      clear();
      router.push(`/confirmation/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <ul className="space-y-4">
        {priced.map(({ it, q }) => (
          <li key={it.id} className="surface rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-black">{byId(it.productId)?.name}</p>
                <p className="mt-1 text-sm text-ink/70">{describeSelection(byId(it.productId), it.selection)}</p>
              </div>
              <p className="shrink-0 font-display text-xl font-black tabular-nums">{q ? peso(q.total) : "-"}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-ink/70">Quantity</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={byId(it.productId)?.qty.min}
                  value={it.qty || ""}
                  onChange={(e) => update(it.id, { qty: Number(e.target.value) })}
                  className="min-h-11 w-24 rounded-lg border border-ink/50 bg-paper px-3"
                />
              </label>
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="min-h-11 text-sm text-teal underline underline-offset-4"
              >
                Remove item
              </button>
            </div>
            {!q && (
              <p className="mt-2 text-sm text-red-700">
                {catalog.some((p) => p.id === it.productId)
                  ? "Enter a valid quantity for this item."
                  : "This item is no longer available. Remove it to continue."}
              </p>
            )}
            <FileUpload files={it.files} onChange={(files) => update(it.id, { files })} />
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="surface rounded-2xl p-5">
          <h2 className="font-display text-lg font-black">Your details</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-base">
              Full name
              <input name="customer" required maxLength={100} autoComplete="name" className={`${field} mt-1`} />
            </label>
            <label className="block text-base">
              Email
              <input name="email" type="email" required autoComplete="email" className={`${field} mt-1`} />
            </label>
            <label className="block text-base">
              Mobile number
              <input name="phone" type="tel" required autoComplete="tel" className={`${field} mt-1`} />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm">How do you want to receive it?</legend>
              <div className="flex gap-2">
                {(["PICKUP", "DELIVERY"] as const).map((d) => (
                  <label
                    key={d}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-bold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal ${
                      delivery === d ? "border-teal bg-teal text-white" : "border-ink/20 bg-paper"
                    }`}
                  >
                    <input type="radio" name="delivery" checked={delivery === d} onChange={() => setDelivery(d)} className="sr-only" />
                    {d === "PICKUP" ? "Pick up" : "Delivery"}
                  </label>
                ))}
              </div>
            </fieldset>
            {delivery === "DELIVERY" && (
              <label className="block text-base">
                Delivery address
                <textarea name="address" required maxLength={500} rows={3} autoComplete="street-address" className={`${field} mt-1`} />
              </label>
            )}
            <label className="block text-base">
              Notes for the shop (optional)
              <textarea name="notes" maxLength={1000} rows={3} className={`${field} mt-1`} />
            </label>
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <dl className="space-y-1.5 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt>Items</dt>
              <dd>{peso(subtotal)}</dd>
            </div>
            {fee > 0 && (
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{peso(fee)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-ink/15 pt-4">
            <span className="text-sm text-ink/70">Total</span>
            <span className="font-display text-3xl font-black tabular-nums">
              {peso(subtotal + fee)}
            </span>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || invalid}
            className="button-primary mt-5 w-full"
          >
            {busy ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-sm text-ink/65">
            You&rsquo;ll see payment instructions on the next page. We start printing once your payment is confirmed.
          </p>
        </div>
      </form>
    </div>
  );
}
