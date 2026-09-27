import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CustomCursor } from "@/components/site/custom-cursor";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
