import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProductRows, rowToProduct } from "@/lib/catalog-db";
import { peso } from "@/lib/quote";

export const metadata = { title: "Products | Admin" };

export default async function Products() {
  await requireAdmin();
  const rows = await getAllProductRows();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">Products</h1>
        <Link href="/admin/products/new" className="flex min-h-11 items-center rounded-xl bg-teal px-4 text-sm font-bold text-white hover:bg-ink">
          Add product
        </Link>
      </div>
      <p className="mt-3 max-w-prose text-ink/70">Changes show on the website right away.</p>
      <ul className="mt-6 space-y-2">
        {rows.map((r) => {
          const p = rowToProduct(r);
          return (
            <li key={r.id}>
              <Link
                href={`/admin/products/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 surface rounded-2xl p-4 hover:outline hover:outline-2 hover:outline-ink"
              >
                <span>
                  <span className="block font-bold">{p.name}</span>
                  <span className="block text-sm text-ink/65">
                    Base {peso(p.base)} per {p.unit}, {p.options.length} option group{p.options.length === 1 ? "" : "s"}
                  </span>
                </span>
                <span className={`rounded-lg px-2 py-1 text-sm ${r.active ? "border border-ink/25" : "bg-gold font-bold"}`}>
                  {r.active ? "Shown" : "Hidden"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
