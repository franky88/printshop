"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { items, ready } = useCart();
  const n = ready ? items.length : 0;
  return (
    <Link href="/cart" className="flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
      Your order{n > 0 ? ` (${n})` : ""}
    </Link>
  );
}
