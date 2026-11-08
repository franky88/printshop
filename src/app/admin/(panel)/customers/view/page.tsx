import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { LABEL, fmtDate, type Status } from "@/lib/orders";
import { QUOTE_LABEL, type QuoteStatus } from "@/lib/quotes";
import { peso } from "@/lib/quote";

export const metadata = { title: "Customer | Admin" };

const PAID = new Set(["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "COMPLETED"]);

export default async function CustomerView({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  await requireAdmin();
  const email = ((await searchParams).email ?? "").trim().toLowerCase();
  if (!email) notFound();

  const same = { equals: email, mode: "insensitive" as const };
  const orders = await prisma.order.findMany({
    where: { email: same },
    orderBy: [{ createdAt: "desc" }],
    include: { items: { include: { product: true } } },
  });
  const quotes = await prisma.customQuoteRequest.findMany({ where: { email: same }, orderBy: [{ createdAt: "desc" }] });
  if (orders.length === 0 && quotes.length === 0) notFound();

  // Newest contact details win.
  const latest =
    orders[0] && (!quotes[0] || orders[0].createdAt >= quotes[0].createdAt)
      ? { name: orders[0].customer, phone: orders[0].phone }
      : { name: quotes[0].name, phone: quotes[0].phone };
  const paid = orders.filter((o) => PAID.has(o.status)).reduce((s, o) => s + Number(o.total), 0);

  return (
    <>
      <Link href="/admin/customers" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-ink underline underline-offset-4">
        All customers
      </Link>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{latest.name}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold">Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-ink/65">No orders yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.code}`}
                      className="grid gap-x-6 gap-y-1 rounded-2xl bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <span className="min-w-0">
                        <span className="block font-display font-bold tabular-nums">{o.code}</span>
                        <span className="block truncate text-sm text-ink/65">
                          {o.items.map((i) => `${i.product.name} × ${i.qty}`).join(", ")}
                        </span>
                        <span className="block text-sm text-ink/65">{fmtDate(o.createdAt)}</span>
                      </span>
                      <span className="sm:text-right">
                        <span className="block font-semibold tabular-nums">{peso(Number(o.total))}</span>
                        <span className="block text-sm text-ink/65">{LABEL[o.status as Status] ?? o.status}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">Quote requests ({quotes.length})</h2>
            {quotes.length === 0 ? (
              <p className="mt-3 text-sm text-ink/65">No quote requests.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {quotes.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/admin/quotes/${r.id}`}
                      className="grid gap-x-6 gap-y-1 rounded-2xl bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{r.details}</span>
                        <span className="block text-sm text-ink/65">{fmtDate(r.createdAt)}</span>
                      </span>
                      <span className="w-fit rounded-sm border border-ink/25 px-2 py-1 text-sm">
                        {QUOTE_LABEL[r.status as QuoteStatus] ?? r.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Contact</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div>
                <a href={`mailto:${email}`} className="text-cyan-ink underline underline-offset-4">{email}</a>
              </div>
              <div>
                <a href={`tel:${latest.phone}`} className="text-cyan-ink underline underline-offset-4">{latest.phone}</a>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Totals</h2>
            <dl className="mt-3 space-y-1 text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-ink/65">Paid</dt>
                <dd className="font-semibold">{peso(paid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/65">Orders</dt>
                <dd>{orders.filter((o) => o.status !== "CANCELLED").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/65">Quote requests</dt>
                <dd>{quotes.length}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
