import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { PortfolioExplorer } from "@/components/site/portfolio-explorer";
import { CTA } from "@/components/site/cta";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "WebCompany.uz tomonidan amalga oshirilgan loyihalar to'plami.",
};

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Biz yaratgan mahsulotlar"
        description="Fintech'dan tortib ta'lim platformalarigacha — turli sohalarda amalga oshirilgan loyihalarimiz."
      />
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <PortfolioExplorer projects={projects} />
        </Container>
      </section>
      <CTA />
    </>
  );
}
