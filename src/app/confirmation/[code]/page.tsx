import { notFound } from "next/navigation";
import Link from "next/link";
import PaymentForm from "@/components/PaymentForm";
import SiteHeader from "@/components/SiteHeader";
import { shop } from "@/config";
import { prisma } from "@/lib/prisma";
import { rowToProduct } from "@/lib/catalog-db";
import { describeSelection, peso } from "@/lib/quote";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order" };

const STATUS: Record<string, string> = {
  RECEIVED: "Waiting for payment",
  PAYMENT_SUBMITTED: "Payment under review",
  PAID: "Paid, waiting to be printed",
  IN_PRODUCTION: "Printing",
  READY: "Ready",
  SHIPPED: "On its way",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function Confirmation({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await prisma.order.findUnique({
    where: { code: code.toUpperCase() },
    include: { items: { include: { product: true, files: true } } },
  });
  if (!order) notFound();

  const status =
    order.status === "READY"
      ? order.delivery === "PICKUP"
        ? "Ready for pickup"
        : "Ready for delivery"
      : (STATUS[order.status] ?? order.status);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Order {order.code}</h1>
        <p className="mt-3 text-lg">
          Status: <strong>{status}</strong>
        </p>
        <p className="mt-1 text-sm text-ink/65">Save this page&rsquo;s link or order number to check on your order.</p>

        <div className="mt-8 bg-paper p-6">
          <ul className="divide-y divide-dashed divide-ink/25">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <div>
                  <p className="font-semibold">
                    {it.product.name} × {it.qty}
                  </p>
                  <p className="text-sm text-ink/70">
                    {it.summary || describeSelection(rowToProduct(it.product), it.selection as Record<string, string>)}
                  </p>
                  <p className="text-sm text-ink/70">
                    {it.files.length > 0
                      ? `${it.files.length} file${it.files.length > 1 ? "s" : ""} attached`
                      : "No file attached yet"}
                  </p>
                </div>
                <p className="tabular-nums">{peso(Number(it.lineTotal))}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-dashed border-ink/25 pt-4 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt>Items</dt>
              <dd>{peso(Number(order.subtotal))}</dd>
            </div>
            {Number(order.shippingFee) > 0 && (
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{peso(Number(order.shippingFee))}</dd>
              </div>
            )}
            <div className="flex justify-between font-display text-lg font-bold">
              <dt>Total</dt>
              <dd>{peso(Number(order.total))}</dd>
            </div>
          </dl>
        </div>

        {order.status === "RECEIVED" && (
          <PaymentForm code={order.code} total={Number(order.total)} methods={shop.payment.methods} />
        )}
        {order.status === "PAYMENT_SUBMITTED" && (
          <p className="mt-8 max-w-prose">
            We got your payment details (reference {order.paymentRef}). We&rsquo;ll verify them and message you when your
            order goes into printing.
          </p>
        )}

        <Link href="/" className="mt-8 inline-flex min-h-11 items-center font-semibold text-cyan-ink underline underline-offset-4">
          Start another quote
        </Link>
      </main>
    </>
  );
}
