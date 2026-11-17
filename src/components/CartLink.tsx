"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { items, ready } = useCart();
  const n = ready ? items.length : 0;
  return (
    <Link
      href="/cart"
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-bold text-white transition-colors hover:bg-ink sm:px-5 sm:text-base"
    >
      Your order
      {n > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold tabular-nums text-ink">
          {n}
        </span>
      )}
    </Link>
  );
}
