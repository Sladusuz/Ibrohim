import type { Locale } from "next-intl";

/**
 * Picks a locale-specific field (e.g. `titleRu` / `titleEn`) off a Prisma
 * record, falling back to the base (Uzbek) field when no translation was
 * entered for that locale in the admin panel.
 */
export function localize<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: Locale
): string {
  const base = item[field] as string;
  if (locale === "uz") return base;
  const suffix = locale === "ru" ? "Ru" : "En";
  const value = item[`${field}${suffix}`] as string | null | undefined;
  return value?.trim() ? value : base;
}
