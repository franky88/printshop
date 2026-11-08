import Link from "next/link";
import CartLink from "./CartLink";
import RegMark from "./RegMark";
import { shop } from "@/config";

export default function SiteHeader() {
  return (
    <div className="sticky top-3 z-30 px-3 pt-3">
      <header className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-4 pr-2">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <RegMark />
          <span className="truncate font-display text-sm font-semibold tracking-tight sm:text-base">{shop.name}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/custom-quote"
            className="hidden min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-ink/5 sm:flex"
          >
            Custom quote
          </Link>
          <CartLink />
        </nav>
      </header>
    </div>
  );
}
