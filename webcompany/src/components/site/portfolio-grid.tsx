import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Project } from "@prisma/client";

export function PortfolioGrid({ projects }: { projects: Project[] }) {
  return (
    <section className="relative bg-slate-50 py-24 sm:py-32">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Portfolio"
            title="Bizning so'nggi ishlarimiz"
            description="Turli sohalardagi mijozlarimiz uchun yaratgan mahsulotlarimiz."
            className="items-start text-left"
          />
          <Button href="/portfolio" variant="ghost" size="md" className="border border-slate-200 shrink-0">
            Barchasini ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <StaggerGroup className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
