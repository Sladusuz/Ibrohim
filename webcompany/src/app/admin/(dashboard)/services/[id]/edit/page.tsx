import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "@/components/admin/service-form";

type Params = Promise<{ id: string }>;

export default async function EditServicePage({ params }: { params: Params }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Xizmatni tahrirlash" description={service.title} />
      <ServiceForm service={service} />
    </div>
  );
}
