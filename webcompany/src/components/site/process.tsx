import { Search, PenTool, Code, Rocket } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    icon: Search,
    title: "Tadqiqot va tahlil",
    description:
      "Biznesingiz maqsadlari, auditoriyasi va bozorni chuqur o'rganamiz, aniq texnik topshiriq shakllantiramiz.",
  },
  {
    icon: PenTool,
    title: "UI/UX dizayn",
    description:
      "Foydalanuvchi tajribasini birinchi o'ringa qo'yib, zamonaviy va intuitiv interfeys prototiplarini yaratamiz.",
  },
  {
    icon: Code,
    title: "Dasturlash",
    description:
      "Chaqqon (Agile) metodologiya asosida, sifat nazorati bilan mustahkam va tez kodni yozamiz.",
  },
  {
    icon: Rocket,
    title: "Ishga tushirish",
    description:
      "Mahsulotni joylashtirib, monitoring va texnik qo'llab-quvvatlashni doimiy ravishda ta'minlaymiz.",
  },
];

export function Process() {
  return (
    <section className="relative bg-slate-50 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Ish jarayoni"
          title="Shaffof va samarali ish jarayoni"
          description="Har bir loyihada bir xil yuqori sifat standartlariga amal qilamiz."
        />

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="relative flex flex-col items-start">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <step.icon className="h-7 w-7 text-brand-600" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-lg font-bold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
