import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/admin/service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Yangi xizmat qo'shish" />
      <ServiceForm />
    </div>
  );
}
