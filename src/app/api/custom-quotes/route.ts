import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminUrl, notifyOwner } from "@/lib/notify";
import { isBlobUrl, str } from "@/lib/validate";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (str(b.website, 100)) return NextResponse.json({ ok: true }); // honeypot filled: pretend success

    const name = str(b.name, 100);
    const email = str(b.email, 200);
    const phone = str(b.phone, 30);
    const details = str(b.details, 3000);
    const fileUrls: string[] = Array.isArray(b.fileUrls) ? b.fileUrls.slice(0, 5).map(String) : [];

    if (!name) return bad("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 7) return bad("Enter a valid mobile number.");
    if (details.length < 10) return bad("Tell us a bit more about what you need.");
    if (!fileUrls.every(isBlobUrl)) return bad("A file link was invalid. Upload that file again.");

    const row = await prisma.customQuoteRequest.create({ data: { name, email, phone, details, fileUrls } });

    await notifyOwner(
      `New quote request from ${name}`,
      [`${name}, ${phone}, ${email}`, "", details.slice(0, 500), "", `${fileUrls.length} file(s) attached`, adminUrl(`/admin/quotes/${row.id}`)].join("\n"),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Quote request failed", e);
    return NextResponse.json({ error: "We couldn't send your request. Please try again." }, { status: 500 });
  }
}
