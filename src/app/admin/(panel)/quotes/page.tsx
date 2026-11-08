import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/orders";
import { QUOTE_FILTERS, QUOTE_LABEL, type QuoteStatus } from "@/lib/quotes";

export const metadata = { title: "Quote requests | Admin" };

export default async function QuoteRequests({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const active = QUOTE_FILTERS.find((f) => f.key === sp.filter) ?? (q ? QUOTE_FILTERS[QUOTE_FILTERS.length - 1] : QUOTE_FILTERS[0]);
  const match = (field: "name" | "email" | "phone" | "details") => ({ [field]: { contains: q, mode: "insensitive" as const } });

  const rows = await prisma.customQuoteRequest.findMany({
    where: {
      status: { in: [...active.statuses] },
      ...(q ? { OR: [match("name"), match("email"), match("phone"), match("details")] } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });
  const counts = await Promise.all(
    QUOTE_FILTERS.map((f) => prisma.customQuoteRequest.count({ where: { status: { in: [...f.statuses] } } })),
  );

  const href = (key: string) => {
    const p = new URLSearchParams();
    if (key !== "new" || q) p.set("filter", key);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/admin/quotes?${s}` : "/admin/quotes";
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Quote requests</h1>
      <AdminSearch action="/admin/quotes" q={q} filter={sp.filter} placeholder="Search by name, email, phone, or request text" />

      <nav aria-label="Quote filters" className="mt-4 flex flex-wrap gap-2">
        {QUOTE_FILTERS.map((f, i) => (
          <Link
            key={f.key}
            href={href(f.key)}
            aria-current={f.key === active.key ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-sm border-2 px-4 text-sm font-medium ${
              f.key === active.key ? "border-ink bg-ink text-white" : "border-ink/20 bg-paper hover:border-ink"
            }`}
          >
            {f.label} <span className="ml-2 tabular-nums opacity-70">{counts[i]}</span>
          </Link>
        ))}
      </nav>

      {q && (
        <p className="mt-4 text-sm text-ink/70">
          {rows.length} result{rows.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          {rows.length === 100 ? " (showing the latest 100)" : ""}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="mt-10 text-ink/70">{q ? "No requests match your search." : "No requests here."}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/quotes/${r.id}`}
                className="grid gap-x-6 gap-y-1 rounded-2xl bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[1fr_auto] sm:items-center"
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
