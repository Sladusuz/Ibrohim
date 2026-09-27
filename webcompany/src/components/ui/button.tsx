import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/magnetic";

type Variant = "primary" | "secondary" | "ghost" | "outline-light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
  secondary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgba(20,179,209,0.6)]",
  ghost: "bg-transparent text-ink-900 hover:bg-slate-100",
  "outline-light":
    "border border-white/25 text-white hover:bg-white/10 backdrop-blur-sm",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-3",
  lg: "text-base px-7 py-3.5",
};

const shineVariants: Variant[] = ["primary", "secondary"];

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

function Shine({ variant }: { variant: Variant }) {
  if (!shineVariants.includes(variant)) return null;
  return (
    <span className="pointer-events-none absolute inset-0 -translate-x-full overflow-hidden rounded-full transition-transform duration-700 ease-out group-hover:translate-x-full">
      <span className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </span>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: CommonProps &
  ({ href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >)) {
  return (
    <Magnetic strength={0.25} className="inline-flex">
      <Link
        href={href}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300 whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        data-cursor-hover
        {...props}
      >
        <Shine variant={variant} />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Link>
    </Magnetic>
  );
}

export function ButtonEl({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Magnetic strength={0.2} className="inline-flex w-full">
      <button
        className={cn(
          "group relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className
        )}
        data-cursor-hover
        {...props}
      >
        <Shine variant={variant} />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    </Magnetic>
  );
}
