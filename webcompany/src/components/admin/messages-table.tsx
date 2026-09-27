"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { Message } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  new: "Yangi",
  read: "O'qilgan",
  replied: "Javob berilgan",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-brand-100 text-brand-700",
  read: "bg-slate-100 text-slate-600",
  replied: "bg-emerald-100 text-emerald-700",
};

export function MessagesTable({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setPendingId(id);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setPendingId(null);
  }

  async function remove(id: string) {
    if (!confirm("Ushbu murojaatni o'chirmoqchimisiz?")) return;
    setPendingId(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
    setPendingId(null);
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
        Hozircha murojaatlar yo&apos;q.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const isOpen = expanded === m.id;
        const isPending = pendingId === m.id;
        return (
          <div
            key={m.id}
            className="rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
          >
            <button
              onClick={() => {
                setExpanded(isOpen ? null : m.id);
                if (m.status === "new") updateStatus(m.id, "read");
              }}
              className="flex w-full flex-col items-start gap-2 px-6 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink-900">{m.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_STYLE[m.status]
                    )}
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                  {m.service && (
                    <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500">
                      {m.service}
                    </span>
                  )}
                </div>
                <p className={cn("mt-1 text-sm text-slate-500", !isOpen && "truncate")}>
                  {m.message}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDate(m.createdAt)}</span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-6 py-4">
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-brand-600">
                    <Mail className="h-4 w-4" />
                    {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-brand-600">
                      <Phone className="h-4 w-4" />
                      {m.phone}
                    </a>
                  )}
                  {m.budget && <span>Byudjet: {m.budget}</span>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {m.status !== "replied" && (
                    <button
                      disabled={isPending}
                      onClick={() => updateStatus(m.id, "replied")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Javob berildi deb belgilash
                    </button>
                  )}
                  <button
                    disabled={isPending}
                    onClick={() => remove(m.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    O&apos;chirish
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
