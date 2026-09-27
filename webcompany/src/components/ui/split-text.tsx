"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  gradientLastWords = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  gradientLastWords?: number;
}) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const wordVariant = {
    hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: EASE },
    },
  };

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
      aria-label={text}
    >
      {words.map((word, i) => {
        const isGradient = gradientLastWords > 0 && i >= words.length - gradientLastWords;
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-top"
            aria-hidden="true"
          >
            <motion.span
              variants={wordVariant}
              className={`inline-block ${isGradient ? "text-gradient-brand" : ""}`}
            >
              {word}
              {i !== words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}
