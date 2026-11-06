// Emails the shop owner through Resend. Does nothing unless RESEND_API_KEY and ADMIN_EMAIL are set.
export function adminUrl(path: string) {
  const base = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return `${base}${path}`;
}

export const adminLink = (code: string) => adminUrl(`/admin/orders/${code}`);

export async function notifyOwner(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "Printshop <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("Owner email failed", res.status, await res.text());
  } catch (e) {
    console.error("Owner email failed", e);
  }
}
