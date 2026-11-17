import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { shop } from "@/config";
import "./globals.css";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap", variable: "--font-lato" });

export const metadata: Metadata = {
  title: { default: `${shop.name} | Printing made simple`, template: `%s | SDMS` },
  description: "Know the price before you send the file. Get a clear quote for documents, photos, business cards, flyers and stickers, then order online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lato.variable}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
