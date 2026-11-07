import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { changeQuoteStatus } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/orders";
import { QUOTE_LABEL, fileName, quoteMoves, type QuoteStatus } from "@/lib/quotes";
import { shop } from "@/config";

const tone = {
  primary: "bg-cyan-ink text-white hover:bg-ink",
  plain: "border-2 border-ink/30 bg-paper hover:border-ink",
};

export default async function QuoteRequest({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const q = await prisma.customQuoteRequest.findUnique({ where: { id } });
  if (!q) notFound();

  const subject = encodeURIComponent(`Your quote request | ${shop.name}`);

  return (
    <>
      <Link href="/admin/quotes" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-ink underline underline-offset-4">
        All quote requests
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h1 className="font-display text-4xl font-bold tracking-tight">{q.name}</h1>
        <p className="text-lg font-semibold">{QUOTE_LABEL[q.status as QuoteStatus] ?? q.status}</p>
      </div>
      <p className="mt-1 text-sm text-ink/65">Received {fmtDate(q.createdAt)}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Request</h2>
            <p className="mt-3 max-w-prose whitespace-pre-line">{q.details}</p>
          </section>
          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Files</h2>
            {q.fileUrls.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm">
                {q.fileUrls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-cyan-ink underline underline-offset-4">
                      {fileName(u)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink/65">No files attached.</p>
            )}
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Contact</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div>
                <a href={`mailto:${q.email}?subject=${subject}`} className="text-cyan-ink underline underline-offset-4">
                  {q.email}
                </a>
              </div>
              <div>
                <a href={`tel:${q.phone}`} className="text-cyan-ink underline underline-offset-4">
                  {q.phone}
                </a>
              </div>
            </dl>
          </section>
          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Update status</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {quoteMoves(q.status).map((m) => (
                <form key={m.to} action={changeQuoteStatus}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="to" value={m.to} />
                  <button type="submit" className={`min-h-11 rounded-sm px-4 text-sm font-semibold ${tone[m.tone]}`}>
                    {m.label}
                  </button>
                </form>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
