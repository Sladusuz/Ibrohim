"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

export function CountUp({
  value,
  className,
  suffix = "",
}: {
  value: string;
  className?: string;
  suffix?: string;
}) {
  const numeric = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (isInView) motionVal.set(numeric);
  }, [isInView, numeric, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
  }, [spring]);

  return (
    <motion.span className={className}>
      <span ref={ref}>0</span>
      {suffix}
    </motion.span>
  );
}
