"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { items, ready } = useCart();
  const n = ready ? items.length : 0;
  return (
    <Link
      href="/cart"
      className="flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-cyan-ink"
    >
      Your order
      {n > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-yolk px-1.5 text-xs font-bold tabular-nums text-ink">
          {n}
        </span>
      )}
    </Link>
  );
}
