"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import type { SettingsMap } from "@/lib/settings";

const SECTIONS: {
  title: string;
  fields: { key: keyof SettingsMap; label: string; type?: string }[];
}[] = [
  {
    title: "Umumiy ma'lumot",
    fields: [
      { key: "site_name", label: "Sayt nomi" },
      { key: "site_tagline", label: "Shior (tagline)" },
      { key: "site_description", label: "Sayt tavsifi", type: "textarea" },
    ],
  },
  {
    title: "Aloqa ma'lumotlari",
    fields: [
      { key: "contact_email", label: "Email" },
      { key: "contact_phone", label: "Telefon raqami" },
      { key: "contact_address", label: "Manzil" },
    ],
  },
  {
    title: "Ijtimoiy tarmoqlar",
    fields: [
      { key: "social_telegram", label: "Telegram havolasi" },
      { key: "social_instagram", label: "Instagram havolasi" },
      { key: "social_linkedin", label: "LinkedIn havolasi" },
      { key: "social_github", label: "GitHub havolasi" },
    ],
  },
  {
    title: "Statistika (bosh sahifada)",
    fields: [
      { key: "stat_projects", label: "Bajarilgan loyihalar soni" },
      { key: "stat_clients", label: "Mamnun mijozlar soni" },
      { key: "stat_experts", label: "Mutaxassislar soni" },
      { key: "stat_years", label: "Yillik tajriba" },
    ],
  },
];

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Saqlashda xatolik yuz berdi.");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-ink-900">{section.title}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => (
              <label
                key={field.key}
                className={field.type === "textarea" ? "flex flex-col gap-2 sm:col-span-2" : "flex flex-col gap-2"}
              >
                <span className="text-sm font-medium text-ink-900">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.key}
                    defaultValue={settings[field.key]}
                    rows={3}
                    className="input resize-none"
                  />
                ) : (
                  <input name={field.key} defaultValue={settings[field.key]} className="input" />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && !loading && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Sozlamalar muvaffaqiyatli saqlandi.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        O&apos;zgarishlarni saqlash
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.85rem;
          border: 1px solid var(--color-slate-200);
          background: white;
          padding: 0.65rem 1rem;
          font-size: 0.9rem;
          color: var(--foreground);
        }
        .input:focus {
          outline: none;
          border-color: var(--color-brand-500);
          box-shadow: 0 0 0 3px rgba(20, 179, 209, 0.15);
        }
      `}</style>
    </form>
  );
}
