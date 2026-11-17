import { BlobNotFoundError, get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isBlobUrl } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  // The admin session cookie is scoped to /admin, so keep downloads under it.
  await requireAdmin();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "File storage is not configured." }, { status: 503, headers: privateHeaders });
  }
  const url = new URL(req.url).searchParams.get("url");
  if (!url || !isBlobUrl(url) || !new URL(url).hostname.endsWith(".private.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "This file link is invalid." }, { status: 400, headers: privateHeaders });
  }

  try {
    const result = await get(url, { access: "private", token });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: "This file could not be found." }, { status: 404, headers: privateHeaders });
    }
    return new Response(result.stream, {
      headers: {
        ...privateHeaders,
        "Content-Type": result.blob.contentType,
        "Content-Disposition": result.blob.contentDisposition.replace(/^inline\b/i, "attachment"),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return NextResponse.json({ error: "This file could not be found." }, { status: 404, headers: privateHeaders });
    }
    console.error("Private file download failed", error);
    return NextResponse.json({ error: "We couldn't open this file. Please try again." }, { status: 502, headers: privateHeaders });
  }
}
