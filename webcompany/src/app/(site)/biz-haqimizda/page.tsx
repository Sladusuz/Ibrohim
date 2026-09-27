import type { Metadata } from "next";
import { Target, Eye, HeartHandshake, Award } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { TechMarquee } from "@/components/site/tech-marquee";
import { CTA } from "@/components/site/cta";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description: "WebCompany.uz jamoasi va qadriyatlari haqida.",
};

const VALUES = [
  {
    icon: Target,
    title: "Natijaga yo'naltirilganlik",
    description: "Har bir loyihada mijozning biznes maqsadlariga xizmat qiluvchi yechimlar yaratamiz.",
  },
  {
    icon: Eye,
    title: "Shaffoflik",
    description: "Loyihaning har bir bosqichida ochiq muloqot va aniq hisobotlar bilan ishlaymiz.",
  },
  {
    icon: HeartHandshake,
    title: "Uzoq muddatli hamkorlik",
    description: "Mijozlarimiz bilan ishonchga asoslangan, uzoq muddatli munosabatlar quramiz.",
  },
  {
    icon: Award,
    title: "Yuqori sifat",
    description: "Kodlash standartlari, testlash va kod review orqali sifatni ta'minlaymiz.",
  },
];

const TEAM = [
  { name: "Ibrohim Abdulboqiyev", role: "Asoschisi va CEO" },
  { name: "Dilnoza Yusupova", role: "Bosh dizayner" },
  { name: "Aziz Karimov", role: "Texnik direktor" },
  { name: "Madina Tosheva", role: "Loyiha menejeri" },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Biz haqimizda"
        title={`${settings.site_name} — g'oyalarni raqamli mahsulotlarga aylantiramiz`}
        description="2018-yildan buyon O'zbekiston va xalqaro bozor uchun yuqori sifatli dasturiy ta'minot yaratamiz."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Bizning hikoyamiz
                </span>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                  Kichik jamoadan yetakchi IT-kompaniyagacha
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  {settings.site_name} bir nechta dasturchidan tashkil topgan
                  kichik jamoa sifatida faoliyatini boshlagan edi. Bugungi
                  kunda biz {settings.stat_experts}+ mutaxassisdan iborat
                  jamoa bo&apos;lib, {settings.stat_clients}+ mijozga xizmat
                  ko&apos;rsatib, {settings.stat_projects}+ loyihani muvaffaqiyatli
                  yakunladik.
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Bizning maqsadimiz — texnologiya yordamida O&apos;zbekiston
                  biznesining raqamli transformatsiyasiga hissa qo&apos;shish
                  va xalqaro standartlarga mos mahsulotlar yaratish.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-5">
                <StatBlock value={settings.stat_years} label="Yillik tajriba" />
                <StatBlock value={settings.stat_projects} label="Bajarilgan loyiha" />
                <StatBlock value={settings.stat_clients} label="Mamnun mijoz" />
                <StatBlock value={settings.stat_experts} label="Mutaxassis" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <TechMarquee />

      <section className="bg-slate-50 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Qadriyatlarimiz"
            title="Bizni boshqalardan ajratib turadigan narsa"
          />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card-hover h-full rounded-3xl border border-slate-200 bg-white p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand-300">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mt-5 text-lg font-bold text-ink-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {v.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Jamoa" title="Loyihangiz ortidagi mutaxassislar" />
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
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

      <CTA />
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
