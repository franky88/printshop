import CustomQuoteForm from "@/components/CustomQuoteForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Request a custom quote" };

export default function CustomQuotePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Request a custom quote</h1>
        <p className="mt-4 max-w-prose text-lg text-ink/75">
          For jobs the calculator doesn&rsquo;t cover, such as special sizes, materials, or very large runs. Describe what
          you need and we&rsquo;ll send you a price.
        </p>
        <CustomQuoteForm />
      </main>
      <SiteFooter />
    </>
  );
}
