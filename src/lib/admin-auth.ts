import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "ps_admin";
const DAYS = 7;

export const adminConfigured = () =>
  !!process.env.ADMIN_PASSWORD && (process.env.ADMIN_SESSION_SECRET ?? "").length >= 16;

const sign = (v: string) => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(v).digest("hex");
const safeEq = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export function passwordOk(input: string) {
  const p = process.env.ADMIN_PASSWORD;
  return !!p && safeEq(input, p);
}

export async function startSession() {
  const exp = String(Date.now() + DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  const [exp, sig] = raw?.split(".") ?? [];
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, sign(exp));
}

// Call at the top of every admin page and every admin action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
