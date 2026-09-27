import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings, getLocalizedSetting } from "@/lib/settings";
import { Hero } from "@/components/site/hero";
import { ServicesGrid } from "@/components/site/services-grid";
import { Process } from "@/components/site/process";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Testimonials } from "@/components/site/testimonials";
import { FAQ } from "@/components/site/faq";
import { CTA } from "@/components/site/cta";
import { ContactSection } from "@/components/site/contact-section";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const tagline = await getLocalizedSetting(settings, "site_tagline");
  const description = await getLocalizedSetting(settings, "site_description");
  return { title: tagline, description };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [settings, services, projects, testimonials] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ orderBy: { order: "asc" }, take: 6 }),
    prisma.project.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
  ]);

  const tagline = await getLocalizedSetting(settings, "site_tagline");

  return (
    <>
      <Hero
        tagline={tagline}
        statValues={{
          projects: settings.stat_projects,
          clients: settings.stat_clients,
          experts: settings.stat_experts,
          years: settings.stat_years,
        }}
      />
      <TechMarquee />
      <ServicesGrid services={services} locale={locale} />
      <Process />
      <PortfolioGrid projects={projects} locale={locale} />
      <Testimonials testimonials={testimonials} locale={locale} />
      <FAQ />
      <CTA />
      <ContactSection settings={settings} />
    </>
  );
}
