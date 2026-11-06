import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/orders";
import { QUOTE_FILTERS, QUOTE_LABEL, type QuoteStatus } from "@/lib/quotes";

export const metadata = { title: "Quote requests | Admin" };

export default async function QuoteRequests({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const active = QUOTE_FILTERS.find((f) => f.key === filter) ?? QUOTE_FILTERS[0];

  const [rows, grouped] = await Promise.all([
    prisma.customQuoteRequest.findMany({
      where: { status: { in: [...active.statuses] } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.customQuoteRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts = new Map<string, number>(grouped.map((g) => [g.status as string, g._count._all]));
  const countFor = (statuses: readonly QuoteStatus[]) => statuses.reduce((n, s) => n + (counts.get(s) ?? 0), 0);

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">Quote requests</h1>
      <nav aria-label="Quote filters" className="mt-6 flex flex-wrap gap-2">
        {QUOTE_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "new" ? "/admin/quotes" : `/admin/quotes?filter=${f.key}`}
            aria-current={f.key === active.key ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-sm border-2 px-4 text-sm font-medium ${
              f.key === active.key ? "border-ink bg-ink text-white" : "border-ink/20 bg-paper hover:border-ink"
            }`}
          >
            {f.label} <span className="ml-2 tabular-nums opacity-70">{countFor(f.statuses)}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-10 text-ink/70">No requests here.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/quotes/${r.id}`}
                className="grid gap-x-6 gap-y-1 bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-sm text-ink/65">{r.details}</span>
                  <span className="block text-sm text-ink/65">
                    {fmtDate(r.createdAt)}
                    {r.fileUrls.length > 0 ? `, ${r.fileUrls.length} file${r.fileUrls.length > 1 ? "s" : ""}` : ""}
                  </span>
                </span>
                <span
                  className={`w-fit rounded-sm px-2 py-1 text-sm ${
                    r.status === "NEW" ? "bg-yolk font-semibold" : "border border-ink/25"
                  }`}
                >
                  {QUOTE_LABEL[r.status as QuoteStatus] ?? r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
