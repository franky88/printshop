import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { shop } from "@/config";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: `${shop.name} | Printing quotes and orders`,
  description: "Get an instant price for documents, photos, business cards, flyers and stickers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
