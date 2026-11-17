import Link from "next/link";
import Calculator from "@/components/Calculator";
import FileTips from "@/components/FileTips";
import HowItWorks from "@/components/HowItWorks";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import PrintSamples from "@/components/PrintSamples";
import { getCatalog } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-10">
        <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Printing made simple</p>
            <h1 className="mt-4 max-w-xl font-display text-[2.6rem] font-black leading-[1.08] tracking-tight sm:text-6xl">
              Know the price before you send the file.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/75">
              Everyday documents. Your next big idea. Choose your print, see a clear price, and order when you&rsquo;re ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#price" className="button-primary">See your price <span aria-hidden="true">↗</span></a>
              <Link href="/custom-quote" className="button-secondary">Request a custom quote</Link>
            </div>
            <p className="mt-5 text-sm text-ink/70">Choose your options. Upload your file. Leave the printing to us.</p>
          </div>
          <PrintSamples />
        </section>

        <section id="price" aria-labelledby="price-heading" className="scroll-mt-28 border-t border-ink/15 pt-12 sm:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Your print, your way</p>
              <h2 id="price-heading" className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Let&rsquo;s get you a price.</h2>
            </div>
            <p className="max-w-sm text-ink/70">Select a product, size, and quantity. Your total updates as you go.</p>
          </div>
          <Calculator catalog={catalog} />
        </section>
        <HowItWorks />
        <FileTips />
        <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-teal/15 bg-teal/5 p-6 sm:mt-24 sm:p-9">
          <div>
            <h2 className="text-2xl font-black">Have something different in mind?</h2>
            <p className="mt-2 max-w-prose text-ink/75">Special sizes, materials, or a bigger run. Tell us what you need.</p>
          </div>
          <Link href="/custom-quote" className="button-primary">Ask for a custom quote <span aria-hidden="true">↗</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
