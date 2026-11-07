import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import ProductEditor from "@/components/ProductEditor";
import { rowToProduct } from "@/lib/catalog-db";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit product | Admin" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const row = await prisma.product.findUnique({ where: { id } });
  if (!row) notFound();
  const product = rowToProduct(row);
  return (
    <>
      <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-ink underline underline-offset-4">
        All products
      </Link>
      <h1 className="font-display text-4xl font-bold tracking-tight">{product.name}</h1>
      <ProductEditor product={product} active={row.active} sortOrder={row.sortOrder} isNew={false} />
    </>
  );
}
