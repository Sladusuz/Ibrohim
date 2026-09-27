"use client";

import { useMemo, useState } from "react";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { cn } from "@/lib/utils";
import type { Project } from "@prisma/client";

export function PortfolioExplorer({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return ["Barchasi", ...Array.from(set)];
  }, [projects]);

  const [active, setActive] = useState("Barchasi");

  const filtered =
    active === "Barchasi" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === cat
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          Ushbu kategoriyada hozircha loyihalar yo&apos;q.
        </p>
      ) : (
        <StaggerGroup key={active} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
