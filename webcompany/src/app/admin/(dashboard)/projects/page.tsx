import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Portfolio"
        description="Bajarilgan loyihalaringizni boshqaring."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" />
            Yangi loyiha
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          Hozircha loyihalar yo&apos;q.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Loyiha</th>
                <th className="px-6 py-3">Kategoriya</th>
                <th className="px-6 py-3">Yil</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image src={p.cover} alt={p.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-medium text-ink-900">
                          {p.title}
                          {p.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                        </div>
                        <div className="truncate text-xs text-slate-400">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.category}</td>
                  <td className="px-6 py-3 text-slate-500">{p.year || "—"}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-ink-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton endpoint={`/api/admin/projects/${p.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
