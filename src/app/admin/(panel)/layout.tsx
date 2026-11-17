import Link from "next/link";
import { logout } from "../actions";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { shop } from "@/config";
import AdminNav from "@/components/AdminNav";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newQuotes = await prisma.customQuoteRequest.count({ where: { status: "NEW" } });
  return (
    <>
      <header className="border-b border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="eyebrow">Shop workspace</p>
            <Link href="/admin" className="mt-1 block font-display text-lg font-black">{shop.name}</Link>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/" className="inline-flex min-h-11 items-center font-bold text-teal hover:underline">View storefront <span aria-hidden="true" className="ml-2">↗</span></Link>
            <form action={logout}><button type="submit" className="button-secondary min-h-11 px-4 py-2 text-sm">Log out</button></form>
          </div>
        </div>
        <AdminNav newQuotes={newQuotes} />
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:pt-12">{children}</main>
    </>
  );
}
