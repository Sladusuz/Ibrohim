import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Project } from "@prisma/client";

export function ProjectCard({ project }: { project: Project }) {
  const stack = safeJsonParse<string[]>(project.stack, []);

  return (
    <SpotlightCard href={`/portfolio/${project.slug}`}>
      <div className="relative aspect-[16/11] overflow-hidden bg-ink-900">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-900 backdrop-blur">
          {project.category}
        </span>
        <span className="absolute right-4 top-4 flex h-9 w-9 -translate-y-2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-600">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
          {project.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}
