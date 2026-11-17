import CustomQuoteForm from "@/components/CustomQuoteForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Request a custom quote" };

export default function CustomQuotePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:pt-14">
        <p className="eyebrow">For something a little different</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">Let&rsquo;s talk about your print.</h1>
        <p className="mt-4 max-w-prose text-lg text-ink/75">
          Need a special size, a different material, or a bigger run? Tell us what you have in mind and we&rsquo;ll send you a clear, custom quote.
        </p>
        <CustomQuoteForm />
      </main>
      <SiteFooter />
    </>
  );
}
