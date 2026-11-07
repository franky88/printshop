import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import Calculator from "@/components/Calculator";
import SiteHeader from "@/components/SiteHeader";
import { getCatalog } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Know the price before you send the file.
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ink/75">
          Choose what you need and set the quantity. Your quote updates as you go.
        </p>
        <p className="mt-2">
          <Link href="/custom-quote" className="inline-flex min-h-11 items-center font-semibold text-cyan-ink underline underline-offset-4">
            Need something else? Request a custom quote
          </Link>
        </p>
        {catalog.length > 0 ? (
          <Calculator catalog={catalog} />
        ) : (
          <p className="mt-10 text-lg">No products are available right now. Please send us a custom quote request.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
