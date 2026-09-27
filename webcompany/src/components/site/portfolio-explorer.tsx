"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "next-intl";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { localize } from "@/lib/localize";
import { cn } from "@/lib/utils";
import type { Project } from "@prisma/client";

const ALL = "__all__";

export function PortfolioExplorer({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = useTranslations("portfolioPage");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) {
      map.set(p.category, localize(p, "category", locale));
    }
    return [{ key: ALL, label: t("filterAll") }, ...Array.from(map, ([key, label]) => ({ key, label }))];
  }, [projects, locale, t]);

  const [active, setActive] = useState(ALL);

  const filtered = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === cat.key
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">{t("empty")}</p>
      ) : (
        <StaggerGroup key={active} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} locale={locale} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
