"use client";

import { Link } from "@/i18n/navigation";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(20,179,209,0.16), transparent 70%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full"
    >
      <Link
        href={href}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-colors duration-300 group-hover:border-brand-300 group-hover:shadow-[0_24px_70px_-30px_rgba(20,179,209,0.4)]",
          className
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background }}
        />
        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </Link>
    </motion.div>
  );
}
