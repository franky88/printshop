import Link from "next/link";
import { shop } from "@/config";
import { contact } from "@/contact";

const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";

export default function SiteFooter() {
  const hasContact = contact.phone || contact.email || contact.facebook;
  return (
    <footer className="mt-20 border-t-4 border-mint bg-ink text-white sm:mt-28">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-8">
          <p className="font-display text-3xl font-black tracking-tight sm:text-4xl">Printing made simple.</p>
          <Link href="/#price" className="inline-flex min-h-11 items-center gap-3 font-bold text-white hover:text-gold">Get your price online <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-black">{shop.name}</p>
            <p className="mt-2 max-w-64 text-white/75">Clear prices. Helpful people. Prints for everyday life.</p>
            {contact.address && <p className="mt-2 whitespace-pre-line text-sm text-white/80">{contact.address}</p>}
            {contact.hours && <p className="mt-2 whitespace-pre-line text-sm text-white/80">{contact.hours}</p>}
          </div>
          <nav aria-label="Footer">
            <p className="font-display text-sm font-black">Order</p>
            <ul className="mt-1 text-sm text-white/90">
              <li>
                <Link href="/#price" className={link}>Price calculator</Link>
              </li>
              <li>
                <Link href="/custom-quote" className={link}>Custom quote</Link>
              </li>
              <li>
                <Link href="/cart" className={link}>Your order</Link>
              </li>
            </ul>
          </nav>
          {hasContact && (
            <div>
              <p className="font-display text-sm font-black">Contact</p>
              <ul className="mt-1 text-sm text-white/90">
                {contact.phone && (
                  <li>
                    <a href={`tel:${contact.phone}`} className={link}>{contact.phone}</a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className={link}>{contact.email}</a>
                  </li>
                )}
                {contact.facebook && (
                  <li>
                    <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <p className="mt-10 border-t border-white/15 pt-6 text-sm text-white/70">
          © {new Date().getFullYear()} {shop.name}. We accept {shop.payment.methods.map((m) => m.label).join(", ")}.
        </p>
      </div>
    </footer>
  );
}
