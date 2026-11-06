import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { shop } from "@/config";
import { getCatalog } from "@/lib/catalog-db";
import { describeSelection, peso, quote, QuoteError } from "@/lib/quote";
import { adminLink, notifyOwner } from "@/lib/notify";
import { isBlobUrl, str } from "@/lib/validate";

class OrderError extends Error {}

type Line = {
  q: ReturnType<typeof quote>;
  name: string;
  summary: string;
  selection: Record<string, string>;
  files: { url: string; name: string; sizeBytes: number }[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newCode = () =>
  `${shop.orderPrefix}-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b: any = await req.json();
    const customer = str(b.customer, 100);
    const email = str(b.email, 200);
    const phone = str(b.phone, 30);
    const address = str(b.address, 500);
    const notes = str(b.notes, 1000);
    const delivery = b.delivery === "DELIVERY" ? "DELIVERY" : "PICKUP";

    if (!customer) throw new OrderError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new OrderError("Enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 7) throw new OrderError("Enter a valid mobile number.");
    if (delivery === "DELIVERY" && !address) throw new OrderError("Enter a delivery address.");
    if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 20) {
      throw new OrderError("Your order is empty.");
    }

    // Prices come from the live catalog and are always recalculated here;
    // the client's numbers are never trusted.
    const catalog = await getCatalog();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines: Line[] = b.items.map((i: any) => {
      const product = catalog.find((p) => p.id === i?.productId);
      const q = quote(product, i?.selection, Number(i?.qty));
      const raw = Array.isArray(i?.files) ? i.files.slice(0, 10) : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files = raw.map((f: any) => {
        if (!isBlobUrl(f?.url)) throw new OrderError("A file link was invalid. Upload that file again.");
        return {
          url: String(f.url),
          name: str(f.name, 200) || "file",
          sizeBytes: Math.max(0, Math.round(Number(f.size)) || 0),
        };
      });
      return { q, name: product!.name, summary: describeSelection(product, i.selection), selection: i.selection, files };
    });

    const subtotal = round2(lines.reduce((s, l) => s + l.q.total, 0));
    const shippingFee = delivery === "DELIVERY" ? shop.deliveryFee : 0;
    const total = round2(subtotal + shippingFee);

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = newCode();
      try {
        await prisma.order.create({
          data: {
            code,
            customer,
            email,
            phone,
            delivery,
            address: address || null,
            notes: notes || null,
            subtotal,
            shippingFee,
            total,
            items: {
              create: lines.map((l) => ({
                productId: l.q.productId,
                summary: l.summary,
                selection: l.selection,
                qty: l.q.qty,
                unitPrice: l.q.unitPrice,
                lineTotal: l.q.total,
                files: { create: l.files },
              })),
            },
          },
        });
        await notifyOwner(
          `New order ${code} (${peso(total)})`,
          [
            `New order ${code}`,
            `${customer}, ${phone}, ${email}`,
            ...lines.map((l) => `${l.name} × ${l.q.qty}`),
            `Total: ${peso(total)} (${delivery === "PICKUP" ? "pickup" : "delivery"})`,
            adminLink(code),
          ].join("\n"),
        );
        return NextResponse.json({ code });
      } catch (e) {
        const clash = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
        if (clash && attempt < 2) continue; // order code collision: try a new code
        throw e;
      }
    }
    throw new Error("Could not generate an order code.");
  } catch (e) {
    if (e instanceof OrderError || e instanceof QuoteError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Order failed", e);
    return NextResponse.json({ error: "We couldn't save your order. Please try again." }, { status: 500 });
  }
}
