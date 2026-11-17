import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { shop } from "@/config";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="main-content" className="mx-auto max-w-md px-5 py-12 sm:py-20">
      <Link href="/" className="text-base font-bold text-teal hover:underline">{shop.name}</Link>
      <div className="surface mt-8 rounded-2xl border-t-4 border-t-teal p-6 sm:p-8">
        <p className="eyebrow">Shop workspace</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Welcome back.</h1>
        <p className="mt-2 text-ink/75">Log in to manage orders, quotes, and prices.</p>
        <LoginForm />
      </div>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-teal hover:underline">← Back to the storefront</Link>
    </main>
  );
}
