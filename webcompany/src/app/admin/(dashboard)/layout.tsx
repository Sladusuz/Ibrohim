import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const unreadCount = await prisma.message.count({ where: { status: "new" } });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar adminName={session.name} unreadCount={unreadCount} />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
