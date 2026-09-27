import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MessagesTable } from "@/components/admin/messages-table";

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Murojaatlar"
        description="Mijozlardan kelgan barcha xabarlar shu yerda."
      />
      <MessagesTable messages={messages} />
    </div>
  );
}
