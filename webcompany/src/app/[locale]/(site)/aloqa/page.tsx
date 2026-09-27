import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection } from "@/components/site/contact-section";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  return { title: t("eyebrow"), description: t("description") };
}

export default async function ContactPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([getSettings(), getTranslations("contactPage")]);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ContactSection settings={settings} locale={locale} />
    </>
  );
}
