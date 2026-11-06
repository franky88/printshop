import Link from "next/link";
import { logout } from "../actions";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { shop } from "@/config";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const link = "flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newQuotes = await prisma.customQuoteRequest.count({ where: { status: "NEW" } });
  return (
    <>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-5 py-5">
        <Link href="/admin" className="font-display text-xl font-bold">
          {shop.name} <span className="font-body text-sm font-normal text-ink/65">admin</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/admin" className={link}>
            Orders
          </Link>
          <Link href="/admin/products" className={link}>
            Prices
          </Link>
          <Link href="/admin/quotes" className={link}>
            Quote requests{newQuotes > 0 ? ` (${newQuotes})` : ""}
          </Link>
          <form action={logout}>
            <button type="submit" className={link}>
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-20">{children}</main>
    </>
  );
}
