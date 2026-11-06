import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shop } from "@/config";
import { isBlobUrl, str } from "@/lib/validate";
import { adminLink, notifyOwner } from "@/lib/notify";
import { peso } from "@/lib/quote";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const b = await req.json();
    const email = str(b.email, 200).toLowerCase();
    const method = str(b.method, 30);
    const reference = str(b.reference, 60);
    const proofUrl = str(b.proofUrl, 500);

    if (!shop.payment.methods.some((m) => m.id === method)) return bad("Choose how you paid.");
    if (reference.length < 4) return bad("Enter the reference number from your payment.");
    if (proofUrl && !isBlobUrl(proofUrl)) return bad("The screenshot link was invalid. Upload it again.");

    const order = await prisma.order.findUnique({ where: { code: code.toUpperCase() } });
    // Same message for a missing order and a wrong email, so order codes can't be probed.
    if (!order || order.email.toLowerCase() !== email) {
      return bad("We couldn't match that email to this order.");
    }
    if (order.status !== "RECEIVED" && order.status !== "PAYMENT_SUBMITTED") {
      return bad("This order can't take a payment update.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAYMENT_SUBMITTED",
        paymentMethod: method,
        paymentRef: reference,
        paymentProofUrl: proofUrl || null,
        paymentSubmittedAt: new Date(),
      },
    });
    await notifyOwner(
      `Payment to verify: ${order.code} (${peso(Number(order.total))})`,
      [`${order.customer} sent payment details for ${order.code}.`, `Method: ${method}`, `Reference: ${reference}`, adminLink(order.code)].join("\n"),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Payment update failed", e);
    return NextResponse.json({ error: "We couldn't save your payment details. Please try again." }, { status: 500 });
  }
}
