import Link from "next/link";
import CartLink from "./CartLink";
import { shop } from "@/config";

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
      <Link href="/" className="font-display text-xl font-bold">
        {shop.name}
      </Link>
      <nav className="flex items-center gap-5">
        <Link href="/custom-quote" className="flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
          Custom quote
        </Link>
        <CartLink />
      </nav>
    </header>
  );
}
