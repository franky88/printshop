import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { FILTERS, LABEL, fmtDate, type Status } from "@/lib/orders";
import { peso } from "@/lib/quote";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  // A search looks through every order unless a tab was picked on purpose.
  const active = FILTERS.find((f) => f.key === sp.filter) ?? (q ? FILTERS[FILTERS.length - 1] : FILTERS[0]);
  const match = (field: "code" | "customer" | "email" | "phone") => ({ [field]: { contains: q, mode: "insensitive" as const } });

  const orders = await prisma.order.findMany({
    where: {
      status: { in: [...active.statuses] },
      ...(q ? { OR: [match("code"), match("customer"), match("email"), match("phone")] } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: { items: { include: { product: true } } },
  });
  const counts = await Promise.all(
    FILTERS.map((f) => prisma.order.count({ where: { status: { in: [...f.statuses] } } })),
  );

  const href = (key: string) => {
    const p = new URLSearchParams();
    if (key !== "open" || q) p.set("filter", key);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
      <AdminSearch action="/admin" q={q} filter={sp.filter} placeholder="Search by order number, name, email, or phone" />

      <nav aria-label="Order filters" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
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
          {orders.length} result{orders.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          {orders.length === 100 ? " (showing the latest 100)" : ""}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-10 text-ink/70">{q ? "No orders match your search." : "No orders here."}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.code}`}
                className="grid gap-x-6 gap-y-1 rounded-2xl bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[9rem_1fr_auto_11rem] sm:items-center"
              >
                <span className="font-display font-bold tabular-nums">{o.code}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{o.customer}</span>
                  <span className="block truncate text-sm text-ink/65">
                    {o.items.map((i) => `${i.product.name} × ${i.qty}`).join(", ")}
                  </span>
                  <span className="block text-sm text-ink/65">
                    {fmtDate(o.createdAt)}, {o.delivery === "PICKUP" ? "pickup" : "delivery"}
                  </span>
                </span>
                <span className="font-semibold tabular-nums sm:text-right">{peso(Number(o.total))}</span>
                <span
                  className={`w-fit rounded-sm px-2 py-1 text-sm sm:justify-self-end ${
                    o.status === "PAYMENT_SUBMITTED" ? "bg-yolk font-semibold" : "border border-ink/25"
                  }`}
                >
                  {LABEL[o.status as Status] ?? o.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
