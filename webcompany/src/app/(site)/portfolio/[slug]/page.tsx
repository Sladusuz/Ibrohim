import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { CTA } from "@/components/site/cta";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { slug: true } });
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) notFound();

  const stack = safeJsonParse<string[]>(project.stack, []);
  const gallery = safeJsonParse<string[]>(project.gallery, [project.cover]);

  const related = await prisma.project.findMany({
    where: { category: project.category, NOT: { id: project.id } },
    take: 3,
  });

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container className="relative">
          <Reveal>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Portfolioga qaytish
            </Link>
          </Reveal>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <Reveal delay={0.05}>
              <div>
                <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                  {project.category}
                </span>
                <h1 className="font-display mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {project.title}
                </h1>
                <p className="mt-4 max-w-xl text-lg text-white/60">
                  {project.summary}
                </p>
              </div>
            </Reveal>

            {project.link && (
              <Reveal delay={0.1}>
                <Button href={project.link} variant="secondary" size="lg">
                  Loyihani ko&apos;rish
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
              <Image src={gallery[0]} alt={project.title} fill className="object-cover" priority />
            </div>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900">
                  Loyiha haqida
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {project.description}
                </p>

                <h3 className="font-display mt-10 text-lg font-bold text-ink-900">
                  Texnologiyalar
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                  Loyiha tafsilotlari
                </h3>
                <ul className="mt-5 space-y-4 text-sm">
                  {project.client && (
                    <DetailRow icon={User} label="Mijoz" value={project.client} />
                  )}
                  {project.year && (
                    <DetailRow icon={Calendar} label="Yil" value={project.year} />
                  )}
                  {project.duration && (
                    <DetailRow icon={Clock} label="Davomiyligi" value={project.duration} />
                  )}
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-slate-50 py-20">
          <Container>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              O&apos;xshash loyihalar
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTA />
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="font-medium text-ink-900">{value}</div>
      </div>
    </li>
  );
}
