import Link from "next/link";
import { shop } from "@/config";
import { contact } from "@/contact";

const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";

export default function SiteFooter() {
  const hasContact = contact.phone || contact.email || contact.facebook;
  return (
    <footer className="mt-28 rounded-t-[2rem] bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
        {/* Press colour bar: the four process inks. */}
        <div aria-hidden className="flex gap-1">
          <span className="h-3 w-12 rounded-full bg-process-c" />
          <span className="h-3 w-12 rounded-full bg-process-m" />
          <span className="h-3 w-12 rounded-full bg-process-y" />
          <span className="h-3 w-12 rounded-full bg-white/80" />
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold">{shop.name}</p>
            {contact.address && <p className="mt-2 whitespace-pre-line text-sm text-white/80">{contact.address}</p>}
            {contact.hours && <p className="mt-2 whitespace-pre-line text-sm text-white/80">{contact.hours}</p>}
          </div>
          <nav aria-label="Footer">
            <p className="font-display text-sm font-semibold">Order</p>
            <ul className="mt-1 text-sm text-white/90">
              <li>
                <Link href="/" className={link}>Price calculator</Link>
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
              <p className="font-display text-sm font-semibold">Contact</p>
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
        <p className="mt-10 text-sm text-white/70">
          © {new Date().getFullYear()} {shop.name}. We accept {shop.payment.methods.map((m) => m.label).join(", ")}.
        </p>
      </div>
    </footer>
  );
}
