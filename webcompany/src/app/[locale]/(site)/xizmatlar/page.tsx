import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/localize";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { getIcon } from "@/components/site/icon-map";
import { CTA } from "@/components/site/cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  return { title: t("eyebrow"), description: t("description") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tServices, services] = await Promise.all([
    getTranslations("servicesPage"),
    getTranslations("services"),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <StaggerItem key={service.id}>
                  <SpotlightCard href={`/xizmatlar/${service.slug}`} className="p-8">
                    <div className="flex h-full flex-col gap-5 sm:flex-row">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-brand-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink-900">
                          {localize(service, "title", locale)}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {localize(service, "summary", locale)}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                          {tServices("cardCta")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </Container>
      </section>

      <CTA locale={locale} />
    </>
  );
}
