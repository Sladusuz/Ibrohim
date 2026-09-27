import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { getLocalizedSetting, type SettingsMap } from "@/lib/settings";

export async function ContactSection({ settings }: { settings: SettingsMap }) {
  const t = await getTranslations("contact");
  const address = await getLocalizedSetting(settings, "contact_address");

  return (
    <section className="relative bg-slate-50 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-ink-950 p-8 text-white sm:p-10">
              <div>
                <h3 className="font-display text-2xl font-bold">{t("infoTitle")}</h3>
                <p className="mt-3 text-white/60">{t("infoDescription")}</p>
                <ul className="mt-8 space-y-6">
                  <ContactItem icon={Mail} label={t("email")}>
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-300">
                      {settings.contact_email}
                    </a>
                  </ContactItem>
                  <ContactItem icon={Phone} label={t("phone")}>
                    <a href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`} className="hover:text-brand-300">
                      {settings.contact_phone}
                    </a>
                  </ContactItem>
                  <ContactItem icon={MapPin} label={t("address")}>
                    {address}
                  </ContactItem>
                  <ContactItem icon={Clock} label={t("hours")}>
                    {t("hoursValue")}
                  </ContactItem>
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ContactItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
          {label}
        </div>
        <div className="mt-0.5 font-medium text-white/85">{children}</div>
      </div>
    </li>
  );
}
