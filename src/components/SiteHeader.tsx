import Link from "next/link";
import CartLink from "./CartLink";
import { shop } from "@/config";

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-30 border-b border-ink/10 bg-paper">
      <header className="mx-auto flex min-h-22 max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" aria-label={`${shop.name} home`} className="min-w-0 max-w-44 flex-1 text-sm font-bold leading-snug text-ink sm:max-w-64 sm:text-lg">
          {shop.name}
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-2 sm:gap-5">
          <Link href="/#price" className="hidden min-h-11 items-center font-bold text-ink/75 hover:text-teal md:flex">Get a price</Link>
          <Link
            href="/custom-quote"
            className="hidden min-h-11 items-center font-bold text-ink/75 hover:text-teal sm:flex"
          >
            Custom quote
          </Link>
          <CartLink />
        </nav>
      </header>
    </div>
  );
}
