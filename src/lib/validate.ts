export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function parseBlobUrl(u: unknown): URL | null {
  if (typeof u !== "string") return null;
  try {
    const x = new URL(u);
    return x.protocol === "https:" && !x.username && !x.password && !x.port &&
      /^[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com$/.test(x.hostname) ? x : null;
  } catch {
    return null;
  }
}

// Keep existing public attachments valid. New private files must belong to the
// store whose read-write token is used by /api/upload and the admin download route.
export function isBlobUrl(u: unknown) {
  const url = parseBlobUrl(u);
  if (!url) return false;
  if (url.hostname.endsWith(".public.blob.vercel-storage.com")) return true;
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([^_]+)_/)?.[1];
  return !!storeId && url.hostname === `${storeId.toLowerCase()}.private.blob.vercel-storage.com`;
}

export function adminFileUrl(url: string) {
  const parsed = parseBlobUrl(url);
  if (!parsed) return "#";
  return parsed.hostname.endsWith(".private.blob.vercel-storage.com")
    ? `/admin/files?url=${encodeURIComponent(url)}`
    : url;
}
