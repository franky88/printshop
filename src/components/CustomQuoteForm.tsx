"use client";

import Link from "next/link";
import { useState } from "react";
import type { FileRef } from "@/lib/cart";
import FileUpload from "./FileUpload";

const field = "min-h-11 w-full rounded-sm border-2 border-ink/20 bg-paper px-3 py-2";

export default function CustomQuoteForm() {
  const [files, setFiles] = useState<FileRef[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/custom-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone"),
          details: f.get("details"),
          website: f.get("website"), // honeypot: real visitors leave this empty
          fileUrls: files.map((x) => x.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-10 bg-paper p-6">
        <h2 className="font-display text-2xl font-bold">Request sent</h2>
        <p className="mt-2 max-w-prose">
          We&rsquo;ll review your details and reply by email or text with a quote.
        </p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-cyan-ink underline underline-offset-4">
          Back to the price calculator
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-5 bg-paper p-6">
      <label className="block text-sm">
        Full name
        <input name="name" required maxLength={100} autoComplete="name" className={`${field} mt-1`} />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className={`${field} mt-1`} />
      </label>
      <label className="block text-sm">
        Mobile number
        <input name="phone" type="tel" required autoComplete="tel" className={`${field} mt-1`} />
      </label>
      <label className="block text-sm">
        What do you need?
        <span className="block text-ink/65">Include the product, size, quantity, material, and when you need it.</span>
        <textarea
          name="details"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          placeholder="Example: 10 tarpaulins, 3×6 ft, for a school event on Dec 12. My design is ready."
          className={`${field} mt-1`}
        />
      </label>
      <div>
        <p className="text-sm">Design or reference files (optional)</p>
        <FileUpload files={files} onChange={setFiles} maxFiles={5} label="Add file" prefix="quote-files" />
      </div>
      {/* Honeypot field, hidden from people. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-sm bg-cyan-ink px-6 font-semibold text-white transition-colors hover:bg-ink disabled:bg-ink/30 sm:w-auto"
      >
        {busy ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
