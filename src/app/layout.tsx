import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Required for the generated icon/opengraph-image files to resolve to
  // absolute URLs, which social scrapers need.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilmxona.uz",
  ),
  title: {
    default: "Ilmxona — O'zbek tilida bepul bilim o'rganing",
    template: "%s — Ilmxona",
  },
  description:
    "Ilmxona — o'zbek tilidagi ochiq bilim platformasi. Amaliy va akademik fanlar bo'yicha bepul kurslar: darslar, misollar, mashqlar va testlar.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4ed8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
