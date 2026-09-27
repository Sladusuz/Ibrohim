import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { getIcon } from "@/components/site/icon-map";
import { localize } from "@/lib/localize";
import type { Service } from "@prisma/client";

export async function ServicesGrid({
  services,
  locale,
}: {
  services: Service[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = getIcon(service.icon);
            return (
              <StaggerItem key={service.id}>
                <SpotlightCard href={`/xizmatlar/${service.slug}`} className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mt-6 text-xl font-bold text-ink-900">
                    {localize(service, "title", locale)}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                    {localize(service, "summary", locale)}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    {t("cardCta")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </Container>
    </section>
  );
}
