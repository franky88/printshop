import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">Let&rsquo;s get you back on paper.</h1>
        <p className="mt-5 max-w-prose text-lg text-ink/75">We couldn&rsquo;t find this page. Check the link, or start with a fresh printing quote.</p>
        <Link href="/" className="button-primary mt-8">Back to the price calculator</Link>
      </main>
      <SiteFooter />
    </>
  );
}
