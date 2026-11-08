import Link from "next/link";
import Calculator from "@/components/Calculator";
import FileTips from "@/components/FileTips";
import HowItWorks from "@/components/HowItWorks";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCatalog } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <main className="relative mx-auto max-w-6xl px-5 pb-10 pt-12 sm:pt-20">
        <div aria-hidden className="halftone pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />
        <section>
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Know the price before you send the file.
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink/75">
            Choose what you need and set the quantity. Your quote updates as you go, and you can upload your file and
            order online.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#price"
              className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 font-semibold text-white transition-colors hover:bg-cyan-ink"
            >
              See your price
            </a>
            <Link
              href="/custom-quote"
              className="inline-flex min-h-12 items-center rounded-full border-2 border-ink/20 bg-paper px-7 font-semibold transition-colors hover:border-ink"
            >
              Request a custom quote
            </Link>
          </div>
        </section>
        <div id="price" className="scroll-mt-28">
          <Calculator catalog={catalog} />
        </div>
        <HowItWorks />
        <FileTips />
      </main>
      <SiteFooter />
    </>
  );
}
