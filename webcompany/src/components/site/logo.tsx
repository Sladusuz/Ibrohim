import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wcGradNav" x1="6" y1="6" x2="94" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A2A4D" />
          <stop offset="0.55" stopColor="#0F7FA6" />
          <stop offset="1" stopColor="#16BEDD" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#wcGradNav)" />
      <g stroke="#EAFBFF" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.75">
        <path d="M70 16 H80 V26" />
        <circle cx="80" cy="26" r="2.6" fill="#EAFBFF" stroke="none" />
        <path d="M20 78 V86" />
        <circle cx="20" cy="86" r="2.6" fill="#EAFBFF" stroke="none" />
      </g>
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill="#FFFFFF"
        letterSpacing="-1"
      >
        WC
      </text>
    </svg>
  );
}

export function Logo({
  variant = "dark",
  showTagline = true,
  className,
}: {
  variant?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
}) {
  const isLight = variant === "light";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight">
          <span className={isLight ? "text-white" : "text-ink-900"}>Web</span>
          <span className="text-brand-500">Company</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em]",
              isLight ? "text-white/50" : "text-slate-400"
            )}
          >
            Enterprise Technology
          </span>
        )}
      </span>
    </span>
  );
}
