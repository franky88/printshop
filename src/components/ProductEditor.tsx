"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import type { Product } from "@/lib/catalog";

type ChoiceS = { id: string; label: string; effect: "none" | "mult" | "add"; value: string };
type OptionS = { id: string; label: string; choices: ChoiceS[] };
type S = {
  name: string; summary: string; unit: string; fulfillment: "in-house" | "outsourced"; active: boolean;
  sortOrder: string; base: string; setupFee: string; minOrder: string;
  qtyMin: string; qtyStep: string; presets: string;
  tiers: { min: string; off: string }[];
  options: OptionS[];
};

const rid = () => Math.random().toString(36).slice(2, 8);
const field = "min-h-11 w-full rounded-sm border-2 border-ink/20 bg-paper px-3 py-2";
const btn = "min-h-11 rounded-sm border-2 border-ink/30 bg-paper px-4 text-sm font-semibold hover:border-ink";
const link = "min-h-11 shrink-0 text-sm text-cyan-ink underline underline-offset-4";
const box = "rounded-2xl bg-paper p-5";

function init(p: Product, active: boolean, sortOrder: number): S {
  return {
    name: p.name, summary: p.summary, unit: p.unit, fulfillment: p.fulfillment, active,
    sortOrder: String(sortOrder), base: String(p.base), setupFee: String(p.setupFee), minOrder: String(p.minOrder),
    qtyMin: String(p.qty.min), qtyStep: String(p.qty.step), presets: p.qty.presets.join(", "),
    tiers: p.tiers.map((t) => ({ min: String(t.min), off: String(Math.round((1 - t.mult) * 10000) / 100) })),
    options: p.options.map((o) => ({
      id: o.id,
      label: o.label,
      choices: o.choices.map((c) => ({
        id: c.id,
        label: c.label,
        effect: c.mult && c.mult !== 1 ? "mult" : c.add ? "add" : "none",
        value: String(c.mult && c.mult !== 1 ? c.mult : (c.add ?? "")),
      })),
    })),
  };
}

function build(s: S) {
  return {
    name: s.name, summary: s.summary, unit: s.unit, fulfillment: s.fulfillment, active: s.active,
    sortOrder: Number(s.sortOrder || 0),
    base: s.base, setupFee: s.setupFee || 0, minOrder: s.minOrder || 0,
    qty: { min: s.qtyMin, step: s.qtyStep, presets: s.presets.split(",").map((x) => x.trim()).filter(Boolean) },
    tiers: s.tiers.map((t) => ({ min: t.min, mult: 1 - Number(t.off || 0) / 100 })),
    options: s.options.map((o) => ({
      id: o.id,
      label: o.label,
      choices: o.choices.map((c) => ({
        id: c.id,
        label: c.label,
        ...(c.effect === "mult" ? { mult: c.value } : c.effect === "add" ? { add: c.value } : {}),
      })),
    })),
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      {label}
      {hint && <span className="block text-ink/65">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function ProductEditor({ product, active, sortOrder, isNew }: { product: Product; active: boolean; sortOrder: number; isNew: boolean }) {
  const [s, setS] = useState<S>(() => init(product, active, sortOrder));
  const [dirty, setDirty] = useState(false);
  const [state, formAction, pending] = useActionState(saveProduct, { ok: false, error: "" });

  const set = (patch: Partial<S>) => { setS((c) => ({ ...c, ...patch })); setDirty(true); };
  const setOpt = (i: number, fn: (o: OptionS) => OptionS) => set({ options: s.options.map((o, k) => (k === i ? fn(o) : o)) });
  const setChoice = (i: number, j: number, patch: Partial<ChoiceS>) =>
    setOpt(i, (o) => ({ ...o, choices: o.choices.map((c, k) => (k === j ? { ...c, ...patch } : c)) }));

  return (
    <form
      action={(fd) => { setDirty(false); formAction(fd); }}
      className="mt-6 max-w-3xl space-y-5"
    >
      <input type="hidden" name="id" value={isNew ? "" : product.id} />
      <input type="hidden" name="payload" value={JSON.stringify(build(s))} />

      <section className={`${box} space-y-4`}>
        <h2 className="font-display text-lg font-bold">Basics</h2>
        <Field label="Name"><input value={s.name} onChange={(e) => set({ name: e.target.value })} maxLength={60} className={field} /></Field>
        <Field label="Short description"><input value={s.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={120} className={field} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unit" hint="One piece, as in 'per page' or 'per A4 sheet'.">
            <input value={s.unit} onChange={(e) => set({ unit: e.target.value })} maxLength={30} className={field} />
          </Field>
          <Field label="Made by" hint="Use 'Partner' if you outsource it.">
            <select value={s.fulfillment} onChange={(e) => set({ fulfillment: e.target.value as S["fulfillment"] })} className={field}>
              <option value="in-house">In-house</option>
              <option value="outsourced">Partner</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order on the page" hint="Lower numbers come first.">
            <input type="number" value={s.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} className={field} />
          </Field>
          <label className="flex min-h-11 items-center gap-3 self-end text-sm">
            <input type="checkbox" checked={s.active} onChange={(e) => set({ active: e.target.checked })} className="h-5 w-5" />
            Show on the website
          </label>
        </div>
      </section>

      <section className={`${box} space-y-4`}>
        <h2 className="font-display text-lg font-bold">Price</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Base price per unit (₱)"><input type="number" step="0.01" min="0" value={s.base} onChange={(e) => set({ base: e.target.value })} className={field} /></Field>
          <Field label="Setup fee (₱)"><input type="number" step="0.01" min="0" value={s.setupFee} onChange={(e) => set({ setupFee: e.target.value })} className={field} /></Field>
          <Field label="Minimum order (₱)"><input type="number" step="0.01" min="0" value={s.minOrder} onChange={(e) => set({ minOrder: e.target.value })} className={field} /></Field>
        </div>
        <p className="text-sm text-ink/65">
          Price = (base price, adjusted by the options below) × quantity, minus bulk discounts, plus the setup fee. The total is never below the minimum order.
        </p>
      </section>

      <section className={`${box} space-y-4`}>
        <h2 className="font-display text-lg font-bold">Quantity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum"><input type="number" min="1" value={s.qtyMin} onChange={(e) => set({ qtyMin: e.target.value })} className={field} /></Field>
          <Field label="Step" hint="Customers can only add this many at a time."><input type="number" min="1" value={s.qtyStep} onChange={(e) => set({ qtyStep: e.target.value })} className={field} /></Field>
        </div>
        <Field label="Quick quantity buttons" hint="Up to 8, separated by commas.">
          <input value={s.presets} onChange={(e) => set({ presets: e.target.value })} className={field} />
        </Field>
      </section>

      <section className={`${box} space-y-3`}>
        <h2 className="font-display text-lg font-bold">Bulk discounts</h2>
        <p className="text-sm text-ink/65">The discount applies to the unit price once the quantity reaches the number in each row.</p>
        {s.tiers.map((t, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <Field label="From quantity"><input type="number" min="1" value={t.min} onChange={(e) => set({ tiers: s.tiers.map((x, k) => (k === i ? { ...x, min: e.target.value } : x)) })} className={`${field} w-32`} /></Field>
            <Field label="% off"><input type="number" min="0" max="99" step="0.5" value={t.off} onChange={(e) => set({ tiers: s.tiers.map((x, k) => (k === i ? { ...x, off: e.target.value } : x)) })} className={`${field} w-28`} /></Field>
            <button type="button" className={link} onClick={() => set({ tiers: s.tiers.filter((_, k) => k !== i) })}>Remove</button>
          </div>
        ))}
        <button type="button" className={btn} onClick={() => set({ tiers: [...s.tiers, { min: "", off: "" }] })}>Add discount row</button>
      </section>

      <section className={`${box} space-y-4`}>
        <h2 className="font-display text-lg font-bold">Options</h2>
        <p className="text-sm text-ink/65">
          Each group is a choice the customer makes, like size or finish. The first choice in a group is selected by default.
          &ldquo;Multiplies price&rdquo; of 1.5 makes it 50% more. &ldquo;Adds ₱ per unit&rdquo; adds a flat amount to each piece.
        </p>
        {s.options.map((o, i) => (
          <fieldset key={o.id} className="space-y-3 border-2 border-dashed border-ink/25 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Group name"><input value={o.label} maxLength={40} onChange={(e) => setOpt(i, (x) => ({ ...x, label: e.target.value }))} className={`${field} w-56`} /></Field>
              <button type="button" className={link} onClick={() => set({ options: s.options.filter((_, k) => k !== i) })}>Remove group</button>
            </div>
            {o.choices.map((c, j) => (
              <div key={c.id} className="flex flex-wrap items-end gap-3">
                <Field label="Choice"><input value={c.label} maxLength={40} onChange={(e) => setChoice(i, j, { label: e.target.value })} className={`${field} w-48`} /></Field>
                <Field label="Price effect">
                  <select value={c.effect} onChange={(e) => setChoice(i, j, { effect: e.target.value as ChoiceS["effect"] })} className={`${field} w-48`}>
                    <option value="none">No change</option>
                    <option value="mult">Multiplies price</option>
                    <option value="add">Adds ₱ per unit</option>
                  </select>
                </Field>
                {c.effect !== "none" && (
                  <Field label={c.effect === "mult" ? "Multiplier" : "₱ per unit"}>
                    <input type="number" step="0.01" min="0" value={c.value} onChange={(e) => setChoice(i, j, { value: e.target.value })} className={`${field} w-28`} />
                  </Field>
                )}
                {o.choices.length > 1 && (
                  <button type="button" className={link} onClick={() => setOpt(i, (x) => ({ ...x, choices: x.choices.filter((_, k) => k !== j) }))}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className={btn} onClick={() => setOpt(i, (x) => ({ ...x, choices: [...x.choices, { id: `c_${rid()}`, label: "", effect: "none", value: "" }] }))}>Add choice</button>
          </fieldset>
        ))}
        <button type="button" className={btn} onClick={() => set({ options: [...s.options, { id: `o_${rid()}`, label: "", choices: [{ id: `c_${rid()}`, label: "", effect: "none", value: "" }] }] })}>
          Add option group
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-cyan-ink px-8 font-semibold text-white transition-colors hover:bg-ink disabled:bg-ink/30">
          {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </button>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        {state.ok && !dirty && !pending && <p role="status" className="text-sm font-medium">Saved. The website now uses these prices.</p>}
      </div>
    </form>
  );
}
