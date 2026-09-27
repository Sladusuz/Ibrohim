import { getTranslations } from "next-intl/server";

const TECHS_ROW_1 = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
];

const TECHS_ROW_2 = [
  "AWS",
  "Tailwind CSS",
  "React Native",
  "GraphQL",
  "Figma",
  "Kubernetes",
];

export async function TechMarquee() {
  const t = await getTranslations("techMarquee");
  const row1 = [...TECHS_ROW_1, ...TECHS_ROW_1];
  const row2 = [...TECHS_ROW_2, ...TECHS_ROW_2];

  return (
    <section className="border-y border-slate-200 bg-white py-10">
      <div className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {t("title")}
      </div>
      <div className="relative space-y-3 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <div className="flex w-max animate-marquee gap-4">
          {row1.map((tech, i) => (
            <TechChip key={`r1-${tech}-${i}`} tech={tech} />
          ))}
        </div>
        <div className="flex w-max animate-marquee-reverse gap-4">
          {row2.map((tech, i) => (
            <TechChip key={`r2-${tech}-${i}`} tech={tech} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechChip({ tech }: { tech: string }) {
  return (
    <span className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-ink-700 whitespace-nowrap transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
      {tech}
    </span>
  );
}
