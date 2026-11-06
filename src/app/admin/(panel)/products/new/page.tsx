import Link from "next/link";
import ProductEditor from "@/components/ProductEditor";
import type { Product } from "@/lib/catalog";

export const metadata = { title: "New product | Admin" };

const blank: Product = {
  id: "",
  name: "",
  summary: "",
  unit: "piece",
  fulfillment: "in-house",
  base: 10,
  setupFee: 0,
  minOrder: 0,
  qty: { min: 1, step: 1, presets: [1, 10, 50] },
  tiers: [{ min: 1, mult: 1 }],
  options: [],
};

export default function NewProduct() {
  return (
    <>
      <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-ink underline underline-offset-4">
        All products
      </Link>
      <h1 className="font-display text-4xl font-bold tracking-tight">New product</h1>
      <ProductEditor product={blank} active={false} sortOrder={100} isNew />
    </>
  );
}
