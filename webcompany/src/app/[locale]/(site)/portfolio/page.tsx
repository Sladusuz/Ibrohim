import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { PortfolioExplorer } from "@/components/site/portfolio-explorer";
import { CTA } from "@/components/site/cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolioPage");
  return { title: t("eyebrow"), description: t("description") };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, projects] = await Promise.all([
    getTranslations("portfolioPage"),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <PortfolioExplorer projects={projects} locale={locale} />
        </Container>
      </section>
      <CTA locale={locale} />
    </>
  );
}
