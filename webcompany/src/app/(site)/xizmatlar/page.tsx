import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { getIcon } from "@/components/site/icon-map";
import { CTA } from "@/components/site/cta";

export const metadata: Metadata = {
  title: "Xizmatlar",
  description: "WebCompany.uz taqdim etadigan IT xizmatlari to'liq ro'yxati.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <PageHero
        eyebrow="Xizmatlar"
        title="To'liq raqamli yechimlar"
        description="Strategiyadan tortib ishga tushirish va rivojlantirishgacha — barcha bosqichlarda yoningizdamiz."
      />

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
                          {service.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {service.summary}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                          Batafsil
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

      <CTA />
    </>
  );
}
