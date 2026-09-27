import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { Hero } from "@/components/site/hero";
import { ServicesGrid } from "@/components/site/services-grid";
import { Process } from "@/components/site/process";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Testimonials } from "@/components/site/testimonials";
import { FAQ } from "@/components/site/faq";
import { CTA } from "@/components/site/cta";
import { ContactSection } from "@/components/site/contact-section";

export default async function HomePage() {
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

  const stats = [
    { label: "Bajarilgan loyihalar", value: settings.stat_projects },
    { label: "Mamnun mijozlar", value: settings.stat_clients },
    { label: "Mutaxassislar", value: settings.stat_experts },
    { label: "Yillik tajriba", value: settings.stat_years },
  ];

  return (
    <>
      <Hero tagline={settings.site_tagline} stats={stats} />
      <TechMarquee />
      <ServicesGrid services={services} />
      <Process />
      <PortfolioGrid projects={projects} />
      <Testimonials testimonials={testimonials} />
      <FAQ />
      <CTA />
      <ContactSection settings={settings} />
    </>
  );
}
