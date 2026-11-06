import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <h1 className="font-display text-3xl font-bold tracking-tight">Shop admin</h1>
      <LoginForm />
    </main>
  );
}
