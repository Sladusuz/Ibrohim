import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS = {
  site_name: "WebCompany.uz",
  site_tagline: "Kelajakni bugun quramiz",
  site_tagline_ru: "Строим будущее уже сегодня",
  site_tagline_en: "Building the future, today",
  site_description:
    "O'zbekistondagi yetakchi IT-kompaniya. Veb-saytlar, mobil ilovalar va raqamli mahsulotlar.",
  site_description_ru:
    "Ведущая IT-компания Узбекистана. Веб-сайты, мобильные приложения и цифровые продукты.",
  site_description_en:
    "Uzbekistan's leading IT company. Websites, mobile apps and digital products.",
  contact_email: "info@webcompany.uz",
  contact_phone: "+998 33 623 33 13",
  contact_address: "Toshkent sh., Amir Temur ko'chasi, 108-uy",
  contact_address_ru: "г. Ташкент, ул. Амира Темура, 108",
  contact_address_en: "Tashkent, Amir Temur street, 108",
  social_telegram: "https://t.me/webcompany_uz",
  social_instagram: "https://instagram.com/webcompany.uz",
  social_linkedin: "https://linkedin.com/company/webcompany-uz",
  social_github: "https://github.com/webcompany-uz",
  stat_projects: "180",
  stat_clients: "95",
  stat_experts: "42",
  stat_years: "8",
} as const;

export type SettingsMap = typeof DEFAULT_SETTINGS & Record<string, string>;

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map as SettingsMap;
}

/**
 * Reads a base setting key, resolved to the current request locale
 * (`<key>_ru` / `<key>_en`), falling back to the base (Uzbek) value.
 */
export async function getLocalizedSetting(settings: SettingsMap, baseKey: string) {
  const locale = await getLocale();
  if (locale === "uz") return settings[baseKey];
  const localizedKey = `${baseKey}_${locale}`;
  return settings[localizedKey] || settings[baseKey];
}
