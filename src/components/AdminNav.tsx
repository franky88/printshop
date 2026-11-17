"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ newQuotes }: { newQuotes: number }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Orders", active: pathname === "/admin" || pathname.startsWith("/admin/orders/") },
    { href: "/admin/customers", label: "Customers", active: pathname.startsWith("/admin/customers") },
    { href: "/admin/products", label: "Products & prices", active: pathname.startsWith("/admin/products") },
    { href: "/admin/quotes", label: "Quote requests", active: pathname.startsWith("/admin/quotes") },
  ];
  return (
    <nav aria-label="Shop administration" className="mx-auto flex max-w-6xl flex-wrap gap-2 px-5 pb-4">
      {links.map((item) => (
        <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}
          className={`flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold transition-colors ${item.active ? "bg-teal text-white" : "text-ink/75 hover:bg-teal/5 hover:text-teal"}`}>
          {item.label}
          {item.href === "/admin/quotes" && newQuotes > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold tabular-nums text-ink">{newQuotes}</span>}
        </Link>
      ))}
    </nav>
  );
}
