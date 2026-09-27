import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection } from "@/components/site/contact-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage");
  return { title: t("eyebrow"), description: t("description") };
}

export default async function ContactPage() {
  const [settings, t] = await Promise.all([getSettings(), getTranslations("contactPage")]);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ContactSection settings={settings} />
    </>
  );
}
