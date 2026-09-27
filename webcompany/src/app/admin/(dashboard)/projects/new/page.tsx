import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Yangi loyiha qo'shish" />
      <ProjectForm />
    </div>
  );
}
