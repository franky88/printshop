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
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">Your order</h1>
        <CartView catalog={catalog} />
      </main>
      <SiteFooter />
    </>
  );
}
