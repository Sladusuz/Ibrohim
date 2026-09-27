import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/localize";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import { getIcon } from "@/components/site/icon-map";
import { CTA } from "@/components/site/cta";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, locale } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return {};
  return {
    title: localize(service, "title", locale),
    description: localize(service, "summary", locale),
  };
}

export async function generateStaticParams() {
  const services = await prisma.service.findMany({ select: { slug: true } });
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) notFound();

  const t = await getTranslations("serviceDetail");
  const benefits = t.raw("benefits") as string[];

  // getIcon returns a stable reference from a static icon map, not a new component.
  const Icon = getIcon(service.icon);
  const otherServices = await prisma.service.findMany({
    where: { NOT: { id: service.id } },
    orderBy: { order: "asc" },
    take: 4,
  });

  const title = localize(service, "title", locale);
  const summary = localize(service, "summary", locale);
  const description = localize(service, "description", locale);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44">
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container className="relative">
          <Reveal>
            <Link
              href="/xizmatlar"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Link>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
              {/* eslint-disable-next-line react-hooks/static-components -- Icon is a stable reference from a static icon map */}
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="font-display mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/60">{summary}</p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <Reveal>
              <div className="prose-none">
                <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
                  {description}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                  {t("whyUsTitle")}
                </h3>
                <ul className="mt-5 space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-ink-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button href="/aloqa" variant="primary" size="md" className="mt-6 w-full">
                  {t("orderCta")}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </Reveal>
          </div>

          {otherServices.length > 0 && (
            <div className="mt-20 border-t border-slate-200 pt-12">
              <h2 className="font-display text-xl font-bold text-ink-900">
                {t("otherServicesTitle")}
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {otherServices.map((s) => (
                  <Link
                    key={s.id}
                    href={`/xizmatlar/${s.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-600"
                  >
                    {localize(s, "title", locale)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      <CTA />
    </>
  );
}
