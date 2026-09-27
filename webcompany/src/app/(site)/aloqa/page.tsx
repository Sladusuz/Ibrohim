import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PageHero } from "@/components/site/page-hero";
import { ContactSection } from "@/components/site/contact-section";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "WebCompany.uz jamoasi bilan bog'laning va loyihangizni muhokama qiling.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Aloqa"
        title="Keling, loyihangizni muhokama qilaylik"
        description="Savolingiz bo'lsa yoki loyiha boshlamoqchi bo'lsangiz, biz bilan bog'laning."
      />
      <ContactSection settings={settings} />
    </>
  );
}
