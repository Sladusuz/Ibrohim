"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/ui/split-text";
import { CountUp } from "@/components/ui/count-up";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({
  tagline,
  stats,
}: {
  tagline: string;
  stats: { label: string; value: string }[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });
  const orb1X = useMotionTemplate`calc(-50% + ${springX}px)`;
  const orb2X = useMotionTemplate`${springX}px`;
  const orb2Y = useMotionTemplate`${springY}px`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.08);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.08);
  }

  const words = tagline.split(" ");
  const firstPart = words.slice(0, -2).join(" ");
  const lastPart = words.slice(-2).join(" ");

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-28 sm:pt-48 sm:pb-36"
    >
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <motion.div
        style={{ x: orb1X, y: springY }}
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand-600/25 glow-orb"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="pointer-events-none absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-violet-500/20 glow-orb"
      />
      <div className="pointer-events-none absolute left-[-10%] bottom-0 h-96 w-96 rounded-full bg-brand-500/10 glow-orb animate-float-slow" />

      <Container className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            O&apos;zbekistondagi yetakchi IT-kompaniya
          </motion.div>

          <h1 className="font-display mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
            <SplitText text={firstPart} delay={0.15} />{" "}
            <SplitText text={lastPart} delay={0.15 + firstPart.split(" ").length * 0.045} gradientLastWords={2} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
          >
            Veb-saytlar, mobil ilovalar va raqamli mahsulotlarni g&apos;oyadan
            ishga tushirishgacha — zamonaviy texnologiyalar va professional
            jamoa bilan quramiz.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button href="/aloqa" variant="secondary" size="lg">
              Loyihani boshlash
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
            <Button href="/portfolio" variant="outline-light" size="lg">
              Ishlarimizni ko&apos;rish
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                <CountUp value={stat.value} suffix="+" />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/45 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
