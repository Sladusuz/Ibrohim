import type { Metadata } from "next";
import { Target, Eye, HeartHandshake, Award } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { TechMarquee } from "@/components/site/tech-marquee";
import { CTA } from "@/components/site/cta";

const VALUE_ICONS = [Target, Eye, HeartHandshake, Award];

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return { title: t("eyebrow"), description: t("description") };
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t, tStats] = await Promise.all([
    getSettings(),
    getTranslations("about"),
    getTranslations("stats"),
  ]);

  const values = t.raw("values") as { title: string; description: string }[];
  const team = t.raw("team") as { name: string; role: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={`${settings.site_name} — ${t("titleSuffix")}`}
        description={t("description")}
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  {t("storyLabel")}
                </span>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                  {t("storyTitle")}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  {t("storyParagraph1", {
                    siteName: settings.site_name,
                    experts: settings.stat_experts,
                    clients: settings.stat_clients,
                    projects: settings.stat_projects,
                  })}
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {t("storyParagraph2")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-5">
                <StatBlock value={settings.stat_years} label={tStats("years")} />
                <StatBlock value={settings.stat_projects} label={tStats("projects")} />
                <StatBlock value={settings.stat_clients} label={tStats("clients")} />
                <StatBlock value={settings.stat_experts} label={tStats("experts")} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <TechMarquee locale={locale} />

      <section className="bg-slate-50 py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow={t("valuesEyebrow")} title={t("valuesTitle")} />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <StaggerItem key={v.title}>
                  <div className="card-hover h-full rounded-3xl border border-slate-200 bg-white p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display mt-5 text-lg font-bold text-ink-900">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {v.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow={t("teamEyebrow")} title={t("teamTitle")} />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <StaggerItem key={member.name}>
                <div className="card-hover rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ink-900 font-display text-2xl font-bold text-white">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-display mt-4 text-base font-bold text-ink-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-600">{member.role}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <CTA locale={locale} />
    </>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7">
      <div className="font-display text-3xl font-extrabold text-ink-900">
        {value}
        <span className="text-brand-500">+</span>
      </div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
