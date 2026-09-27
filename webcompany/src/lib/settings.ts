import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS = {
  site_name: "WebCompany.uz",
  site_tagline: "Kelajakni bugun quramiz",
  site_description:
    "O'zbekistondagi yetakchi IT-kompaniya. Veb-saytlar, mobil ilovalar va raqamli mahsulotlar.",
  contact_email: "info@webcompany.uz",
  contact_phone: "+998 33 623 33 13",
  contact_address: "Toshkent sh., Amir Temur ko'chasi, 108-uy",
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
