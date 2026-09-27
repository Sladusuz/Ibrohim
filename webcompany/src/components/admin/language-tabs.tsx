"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type FormLocale = "uz" | "ru" | "en";

const TABS: { key: FormLocale; label: string }[] = [
  { key: "uz", label: "O'zbekcha" },
  { key: "ru", label: "Русский" },
  { key: "en", label: "English" },
];

/**
 * Renders all three language panels at once (so typed values survive tab
 * switches in an uncontrolled form) and just toggles their visibility.
 */
export function LanguageTabs({
  children,
}: {
  children: (active: FormLocale) => React.ReactNode;
}) {
  const [active, setActive] = useState<FormLocale>("uz");

  return (
    <div>
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active === tab.key ? "bg-white text-ink-900 shadow-sm" : "text-slate-500 hover:text-ink-700"
            )}
          >
            {tab.label}
            {tab.key === "uz" && <span className="ml-1 text-brand-500">*</span>}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-5">
        {TABS.map((tab) => (
          <div key={tab.key} className={tab.key === active ? "space-y-5" : "hidden"}>
            {children(tab.key)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function fieldName(base: string, locale: FormLocale) {
  if (locale === "uz") return base;
  return `${base}${locale === "ru" ? "Ru" : "En"}`;
}
