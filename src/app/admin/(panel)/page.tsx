import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FILTERS, LABEL, fmtDate, type Status } from "@/lib/orders";
import { peso } from "@/lib/quote";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const [orders, grouped] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: [...active.statuses] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = new Map<string, number>(grouped.map((g) => [g.status as string, g._count._all]));
  const countFor = (statuses: readonly Status[]) => statuses.reduce((n, s) => n + (counts.get(s) ?? 0), 0);

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">Orders</h1>

      <nav aria-label="Order filters" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "open" ? "/admin" : `/admin?filter=${f.key}`}
            aria-current={f.key === active.key ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-sm border-2 px-4 text-sm font-medium ${
              f.key === active.key ? "border-ink bg-ink text-white" : "border-ink/20 bg-paper hover:border-ink"
            }`}
          >
            {f.label} <span className="ml-2 tabular-nums opacity-70">{countFor(f.statuses)}</span>
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-10 text-ink/70">No orders here.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.code}`}
                className="grid gap-x-6 gap-y-1 bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[9rem_1fr_auto_11rem] sm:items-center"
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
