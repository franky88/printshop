import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog-db";
import { quote, QuoteError } from "@/lib/quote";

export async function POST(req: Request) {
  try {
    const { productId, selection, qty } = await req.json();
    const catalog = await getCatalog();
    return NextResponse.json(quote(catalog.find((p) => p.id === productId), selection, qty));
  } catch (e) {
    if (e instanceof QuoteError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("Quote failed", e);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
