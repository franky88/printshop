import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// Issues short-lived upload tokens. No onUploadCompleted callback is used: we only need the file URL,
// and that callback can stall uploads when the site is behind Vercel's deployment protection.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HandleUploadBody;
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/pdf",
          "image/png",
          "image/jpeg",
          "application/illustrator",
          "image/vnd.adobe.photoshop",
        ],
        maximumSizeInBytes: 100 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(json);
  } catch (e) {
    console.error("Upload token failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload not allowed." }, { status: 400 });
  }
}
