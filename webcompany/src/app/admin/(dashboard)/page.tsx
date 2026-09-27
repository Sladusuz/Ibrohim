import Link from "next/link";
import { MessageSquare, FolderKanban, Wrench, MailOpen, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminDashboardPage() {
  const [messageCount, unreadCount, projectCount, serviceCount, recentMessages] =
    await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: "new" } }),
      prisma.project.count(),
      prisma.service.count(),
      prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Boshqaruv paneli"
        description="Saytingizning umumiy holati bir qarashda."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jami murojaatlar" value={messageCount} icon={MessageSquare} accent="brand" />
        <StatCard label="O'qilmagan murojaatlar" value={unreadCount} icon={MailOpen} accent="amber" />
        <StatCard label="Portfolio loyihalari" value={projectCount} icon={FolderKanban} accent="violet" />
        <StatCard label="Xizmatlar" value={serviceCount} icon={Wrench} accent="emerald" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink-900">So&apos;nggi murojaatlar</h2>
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
          >
            Barchasini ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            Hozircha murojaatlar yo&apos;q.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentMessages.map((m) => (
              <li key={m.id}>
                <Link
                  href="/admin/messages"
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {m.status === "new" && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                      )}
                      <span className="truncate font-medium text-ink-900">{m.name}</span>
                      <span className="truncate text-sm text-slate-400">{m.email}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{m.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(m.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
