import { getSettings } from "@/lib/settings";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Sozlamalar"
        description="Sayt bo'ylab ko'rsatiladigan umumiy ma'lumotlarni tahrirlang."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
