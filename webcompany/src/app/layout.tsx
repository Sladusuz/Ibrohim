import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://webcompany.uz"),
  title: {
    default: "WebCompany.uz — Kelajakni bugun quramiz",
    template: "%s — WebCompany.uz",
  },
  description:
    "WebCompany.uz — O'zbekistondagi yetakchi IT-kompaniya. Veb-saytlar, mobil ilovalar, UI/UX dizayn va raqamli mahsulotlarni ishlab chiqamiz.",
  keywords: [
    "IT kompaniya",
    "veb sayt yaratish",
    "mobil ilova",
    "dasturlash",
    "UI UX dizayn",
    "WebCompany",
    "Uzbekistan IT",
  ],
  icons: {
    icon: "/brand/icon.svg",
    shortcut: "/brand/icon.svg",
    apple: "/brand/icon.svg",
  },
  openGraph: {
    title: "WebCompany.uz — Kelajakni bugun quramiz",
    description:
      "O'zbekistondagi yetakchi IT-kompaniya. Veb-saytlar, mobil ilovalar va raqamli mahsulotlar.",
    url: "https://webcompany.uz",
    siteName: "WebCompany.uz",
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-ink-900 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
