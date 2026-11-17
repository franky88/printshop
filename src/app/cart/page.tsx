import CartView from "@/components/CartView";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCatalog } from "@/lib/catalog-db";

export const metadata = { title: "Your order" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:pt-14">
        <p className="eyebrow">A step closer to print</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">Your order</h1>
        <p className="mt-3 max-w-prose text-lg text-ink/75">Review your prints, add your files, and tell us where they&rsquo;re going.</p>
        <CartView catalog={catalog} />
      </main>
      <SiteFooter />
    </>
  );
}
