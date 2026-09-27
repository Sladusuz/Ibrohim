import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getIcon } from "@/components/site/icon-map";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Xizmatlar"
        description="Sayt orqali taklif qilinayotgan xizmatlarni boshqaring."
        action={
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" />
            Yangi xizmat
          </Link>
        }
      />

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          Hozircha xizmatlar yo&apos;q.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <div
                key={s.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink-900">{s.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/services/${s.id}/edit`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-ink-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton endpoint={`/api/admin/services/${s.id}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
