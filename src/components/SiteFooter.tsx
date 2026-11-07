import Link from "next/link";
import { shop } from "@/config";
import { contact } from "@/contact";

const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";

export default function SiteFooter() {
  const hasContact = contact.phone || contact.email || contact.facebook;
  return (
    <footer className="mt-20 border-t-2 border-dashed border-ink/25">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{shop.name}</p>
          {contact.address && <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{contact.address}</p>}
          {contact.hours && <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{contact.hours}</p>}
        </div>
        <nav aria-label="Footer">
          <p className="font-display font-semibold">Order</p>
          <ul className="mt-1 text-sm">
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
            <p className="font-display font-semibold">Contact</p>
            <ul className="mt-1 text-sm">
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
      <div className="mx-auto max-w-6xl px-5 pb-8 text-sm text-ink/65">
        <p>
          © {new Date().getFullYear()} {shop.name}. We accept {shop.payment.methods.map((m) => m.label).join(", ")}.
        </p>
      </div>
    </footer>
  );
}
