import { Star, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/ui/reveal";
import { localize } from "@/lib/localize";
import type { Testimonial } from "@prisma/client";

export async function Testimonials({
  testimonials,
  locale,
}: {
  testimonials: Testimonial[];
  locale: Locale;
}) {
  if (testimonials.length === 0) return null;
  const t = await getTranslations("testimonials");

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

        <StaggerGroup className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <StaggerItem key={item.id}>
              <figure className="card-hover flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <Quote className="h-8 w-8 text-brand-300" />
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-slate-600">
                  &ldquo;{localize(item, "quote", locale)}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-bold text-white">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-900">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {localize(item, "role", locale)}, {item.company}
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
