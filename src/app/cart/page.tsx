import CartView from "@/components/CartView";
import SiteHeader from "@/components/SiteHeader";
import { getCatalog } from "@/lib/catalog-db";

export const metadata = { title: "Your order" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your order</h1>
        <CartView catalog={catalog} />
      </main>
    </>
  );
}
