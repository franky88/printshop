export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Only accept links that point at our own Vercel Blob store.
export function isBlobUrl(u: unknown) {
  try {
    const x = new URL(String(u));
    return x.protocol === "https:" && x.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
