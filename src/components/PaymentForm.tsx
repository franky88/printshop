"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PaymentMethod } from "@/config";
import type { FileRef } from "@/lib/cart";
import { peso } from "@/lib/quote";
import FileUpload from "./FileUpload";

const field = "min-h-11 w-full rounded-lg border border-ink/50 bg-paper px-3 py-2";

export default function PaymentForm({ code, total, methods }: { code: string; total: number; methods: PaymentMethod[] }) {
  const router = useRouter();
  const [methodId, setMethodId] = useState(methods[0].id);
  const [proof, setProof] = useState<FileRef[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const method = methods.find((m) => m.id === methodId) ?? methods[0];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${code}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: f.get("email"),
          method: methodId,
          reference: f.get("reference"),
          proofUrl: proof[0]?.url ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <section className="surface mt-8 rounded-2xl border-t-4 border-t-teal p-6 sm:p-8">
      <p className="eyebrow mb-2">Next step: payment</p>
      <h2 className="font-display text-2xl font-black">Pay for your order</h2>
      <p className="mt-2 text-ink/75">
        Send exactly <strong className="tabular-nums">{peso(total)}</strong>, then tell us how you paid below.
      </p>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-bold">Pay with</legend>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === methodId}
              onClick={() => setMethodId(m.id)}
              className={`min-h-11 rounded-lg border-2 px-4 text-sm font-bold transition-colors ${
                m.id === methodId ? "border-teal bg-teal text-white" : "border-ink/20 bg-paper hover:border-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <dl className="mt-4 space-y-2 rounded-xl border border-teal/20 bg-teal/5 p-4 text-sm">
        {method.bank && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink/65">Bank</dt>
            <dd>{method.bank}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink/65">Account name</dt>
          <dd>{method.accountName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink/65">Account number</dt>
          <dd className="font-bold tabular-nums">{method.accountNumber}</dd>
        </div>
      </dl>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-base">
          Reference number from your payment
          <input name="reference" required minLength={4} maxLength={60} className={`${field} mt-1`} />
        </label>
        <label className="block text-base">
          Email you used for this order
          <input name="email" type="email" required autoComplete="email" className={`${field} mt-1`} />
        </label>
        <div>
          <p className="text-sm">Screenshot of your payment (optional)</p>
          <FileUpload
            files={proof}
            onChange={setProof}
            extensions={["png", "jpg", "jpeg", "pdf"]}
            maxFiles={1}
            label="Add screenshot"
            prefix="payment-proof"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="button-primary w-full sm:w-auto"
        >
          {busy ? "Sending…" : "Submit payment details"}
        </button>
      </form>
    </section>
  );
}
