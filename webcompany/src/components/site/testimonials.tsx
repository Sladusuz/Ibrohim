import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import type { Testimonial } from "@prisma/client";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Mijozlar fikri"
          title="Mijozlarimiz biz haqimizda nima deyishadi"
        />

        <StaggerGroup className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <figure className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <Quote className="h-8 w-8 text-brand-300" />
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-slate-600">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-900">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
