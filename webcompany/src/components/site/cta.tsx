import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 sm:py-28">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/25 glow-orb" />

      <Container className="relative">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Loyihangizni birga hayotga tatbiq etaylik
            </h2>
            <p className="max-w-xl text-lg text-white/60">
              Bepul konsultatsiya oling va biznesingiz uchun eng yaxshi raqamli
              yechimni topamiz.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button href="/aloqa" variant="secondary" size="lg">
                Bepul konsultatsiya
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button href="/portfolio" variant="outline-light" size="lg">
                Portfolioni ko&apos;rish
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
