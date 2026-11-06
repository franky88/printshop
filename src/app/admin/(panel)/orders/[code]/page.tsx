import Link from "next/link";
import { notFound } from "next/navigation";
import { changeStatus } from "../../../actions";
import { prisma } from "@/lib/prisma";
import { LABEL, fmtDate, movesFor, type Status } from "@/lib/orders";
import { rowToProduct } from "@/lib/catalog-db";
import { describeSelection, peso } from "@/lib/quote";
import { shop } from "@/config";

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const tone = {
  primary: "bg-cyan-ink text-white hover:bg-ink",
  plain: "border-2 border-ink/30 bg-paper hover:border-ink",
  danger: "text-red-700 underline underline-offset-4",
};

export default async function AdminOrder({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: { include: { product: true, files: true } } },
  });
  if (!order) notFound();

  const moves = movesFor(order.status, order.delivery);
  const method = shop.payment.methods.find((m) => m.id === order.paymentMethod)?.label ?? order.paymentMethod;

  return (
    <>
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-ink underline underline-offset-4">
        All orders
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h1 className="font-display text-4xl font-bold tracking-tight tabular-nums">{order.code}</h1>
        <p className="text-lg font-semibold">{LABEL[order.status as Status] ?? order.status}</p>
      </div>
      <p className="mt-1 text-sm text-ink/65">Placed {fmtDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {order.items.map((it) => (
            <section key={it.id} className="bg-paper p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    {it.product.name} × {it.qty}
                  </h2>
                  <p className="text-sm text-ink/70">{it.summary || describeSelection(rowToProduct(it.product), it.selection as Record<string, string>)}</p>
                </div>
                <p className="font-semibold tabular-nums">{peso(Number(it.lineTotal))}</p>
              </div>
              {it.files.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {it.files.map((f) => (
                    <li key={f.id}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-cyan-ink underline underline-offset-4">
                        {f.name}
                      </a>{" "}
                      <span className="text-ink/60">({kb(f.sizeBytes)})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink/65">No print file attached.</p>
              )}
            </section>
          ))}
          <dl className="space-y-1.5 bg-paper p-5 text-sm tabular-nums">
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

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {moves.length > 0 && (
            <section className="bg-paper p-5">
              <h2 className="font-display text-lg font-bold">Update status</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {moves.map((m) => (
                  <form key={m.to + m.label} action={changeStatus}>
                    <input type="hidden" name="code" value={order.code} />
                    <input type="hidden" name="to" value={m.to} />
                    <button type="submit" className={`min-h-11 rounded-sm px-4 text-sm font-semibold ${tone[m.tone]}`}>
                      {m.label}
                    </button>
                  </form>
                ))}
              </div>
            </section>
          )}

          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Payment</h2>
            {order.paymentRef ? (
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/65">Method</dt>
                  <dd>{method}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/65">Reference</dt>
                  <dd className="font-semibold tabular-nums">{order.paymentRef}</dd>
                </div>
                {order.paymentSubmittedAt && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/65">Submitted</dt>
                    <dd>{fmtDate(order.paymentSubmittedAt)}</dd>
                  </div>
                )}
                {order.paymentProofUrl && (
                  <div>
                    <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-cyan-ink underline underline-offset-4">
                      Open screenshot
                    </a>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/65">Marked paid</dt>
                    <dd>{fmtDate(order.paidAt)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-ink/70">
                {order.paidAt ? `Marked paid ${fmtDate(order.paidAt)}.` : "No payment details from the customer yet."}
              </p>
            )}
          </section>

          <section className="bg-paper p-5">
            <h2 className="font-display text-lg font-bold">Customer</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div>{order.customer}</div>
              <div>
                <a href={`mailto:${order.email}`} className="text-cyan-ink underline underline-offset-4">
                  {order.email}
                </a>
              </div>
              <div>
                <a href={`tel:${order.phone}`} className="text-cyan-ink underline underline-offset-4">
                  {order.phone}
                </a>
              </div>
              <div className="pt-2 font-medium">{order.delivery === "PICKUP" ? "Pickup" : "Delivery"}</div>
              {order.address && <div className="whitespace-pre-line">{order.address}</div>}
              {order.notes && (
                <div className="pt-2">
                  <span className="text-ink/65">Notes: </span>
                  <span className="whitespace-pre-line">{order.notes}</span>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
