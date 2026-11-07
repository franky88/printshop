import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/orders";
import { peso } from "@/lib/quote";

export const metadata = { title: "Customers | Admin" };

const PAID = new Set(["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "COMPLETED"]);
const SHOWN = 200;

type Customer = { email: string; name: string; phone: string; orders: number; quotes: number; paid: number; last: Date };

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const needle = q.toLowerCase();

  const orders = await prisma.order.findMany({
    select: { customer: true, email: true, phone: true, total: true, status: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }],
    take: 5000,
  });
  const quotes = await prisma.customQuoteRequest.findMany({
    select: { name: true, email: true, phone: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }],
    take: 5000,
  });

  // Customers are people grouped by email. The newest name and phone number win.
  const map = new Map<string, Customer>();
  const touch = (email: string, name: string, phone: string, date: Date) => {
    const key = email.trim().toLowerCase();
    let c = map.get(key);
    if (!c) {
      c = { email: key, name, phone, orders: 0, quotes: 0, paid: 0, last: date };
      map.set(key, c);
    } else if (date > c.last) {
      c.name = name;
      c.phone = phone;
      c.last = date;
    }
    return c;
  };
  for (const o of orders) {
    const c = touch(o.email, o.customer, o.phone, o.createdAt);
    if (o.status !== "CANCELLED") c.orders += 1;
    if (PAID.has(o.status)) c.paid += Number(o.total);
  }
  for (const r of quotes) touch(r.email, r.name, r.phone, r.createdAt).quotes += 1;

  const all = [...map.values()].sort((a, b) => b.last.getTime() - a.last.getTime());
  const list = needle
    ? all.filter((c) => [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(needle)))
    : all;

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">Customers</h1>
      <p className="mt-3 max-w-prose text-ink/70">
        Everyone who placed an order or sent a quote request, grouped by email. &ldquo;Paid&rdquo; adds up orders from
        confirmed payment onward.
      </p>
      <AdminSearch action="/admin/customers" q={q} placeholder="Search by name, email, or phone" />
      <p className="mt-4 text-sm text-ink/70">
        {list.length} {q ? `match${list.length === 1 ? "" : "es"}` : `customer${list.length === 1 ? "" : "s"}`}
        {list.length > SHOWN ? ` (showing the ${SHOWN} most recent)` : ""}
      </p>

      {list.length === 0 ? (
        <p className="mt-6 text-ink/70">{q ? "No customers match your search." : "No customers yet."}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.slice(0, SHOWN).map((c) => (
            <li key={c.email}>
              <Link
                href={`/admin/customers/view?email=${encodeURIComponent(c.email)}`}
                className="grid gap-x-6 gap-y-1 bg-paper p-4 hover:outline hover:outline-2 hover:outline-ink sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block truncate text-sm text-ink/65">
                    {c.email}, {c.phone}
                  </span>
                  <span className="block text-sm text-ink/65">
                    {c.orders} order{c.orders === 1 ? "" : "s"}, {c.quotes} quote request{c.quotes === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="sm:text-right">
                  <span className="block font-semibold tabular-nums">{peso(c.paid)} paid</span>
                  <span className="block text-sm text-ink/65">Last activity {fmtDate(c.last)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
