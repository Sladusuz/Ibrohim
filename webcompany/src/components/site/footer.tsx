import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TelegramIcon, InstagramIcon, LinkedInIcon, GitHubIcon } from "@/components/site/social-icons";
import { Logo } from "@/components/site/logo";
import { Container } from "@/components/ui/container";
import { getSettings, getLocalizedSetting } from "@/lib/settings";

export async function Footer() {
  const [settings, t] = await Promise.all([getSettings(), getTranslations("footer")]);
  const tNav = await getTranslations("nav");

  const description = await getLocalizedSetting(settings, "site_description");
  const address = await getLocalizedSetting(settings, "contact_address");

  const columns = [
    {
      title: t("company"),
      links: [
        { href: "/biz-haqimizda", label: tNav("about") },
        { href: "/portfolio", label: tNav("portfolio") },
        { href: "/xizmatlar", label: tNav("services") },
        { href: "/aloqa", label: tNav("contact") },
      ],
    },
    {
      title: tNav("services"),
      links: [
        { href: "/xizmatlar/veb-sayt-yaratish", label: t("service1") },
        { href: "/xizmatlar/mobil-ilovalar", label: t("service2") },
        { href: "/xizmatlar/ui-ux-dizayn", label: t("service3") },
        { href: "/xizmatlar/sun-iy-intellekt", label: t("service4") },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-600/20 glow-orb" />
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-violet-500/10 glow-orb" />

      <Container className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div className="max-w-sm">
            <Logo variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-white/50">{description}</p>
            <div className="mt-6 flex items-center gap-3">
              {settings.social_telegram && (
                <SocialIcon href={settings.social_telegram} label="Telegram">
                  <TelegramIcon className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings.social_instagram && (
                <SocialIcon href={settings.social_instagram} label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings.social_linkedin && (
                <SocialIcon href={settings.social_linkedin} label="LinkedIn">
                  <LinkedInIcon className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings.social_github && (
                <SocialIcon href={settings.social_github} label="GitHub">
                  <GitHubIcon className="h-4 w-4" />
                </SocialIcon>
              )}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-brand-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
              {tNav("contact")}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-white">
                  {settings.contact_email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`} className="hover:text-white">
                  {settings.contact_phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.site_name}. {t("rights")}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {t("systemsOk")}
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-300"
    >
      {children}
    </a>
  );
}
