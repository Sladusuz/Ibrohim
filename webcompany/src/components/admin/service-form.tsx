"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, AlertCircle, Languages } from "lucide-react";
import { ICON_MAP, getIcon } from "@/components/site/icon-map";
import { LanguageTabs, fieldName } from "@/components/admin/language-tabs";
import type { Service } from "@prisma/client";

function getField(service: Service | undefined, base: string, locale: "uz" | "ru" | "en") {
  if (!service) return "";
  const key = fieldName(base, locale) as keyof Service;
  return locale === "uz" ? (service[key] as string) : ((service[key] as string | null) ?? "");
}

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [icon, setIcon] = useState(service?.icon ?? "code-2");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const str = (key: string) => (data.get(key) as string)?.trim() || "";

    const payload = {
      title: str("title"),
      slug: str("slug"),
      summary: str("summary"),
      description: str("description"),
      titleRu: str("titleRu"),
      summaryRu: str("summaryRu"),
      descriptionRu: str("descriptionRu"),
      titleEn: str("titleEn"),
      summaryEn: str("summaryEn"),
      descriptionEn: str("descriptionEn"),
      icon,
      order: Number(data.get("order")) || 0,
    };

    try {
      const url = service ? `/api/admin/services/${service.id}` : "/api/admin/services";
      const method = service ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Xatolik yuz berdi.");

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div>
        <span className="text-sm font-medium text-ink-900">Ikonka</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.keys(ICON_MAP).map((key) => {
            const Icon = getIcon(key);
            const active = icon === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setIcon(key)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  active
                    ? "border-brand-400 bg-brand-500 text-white"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Slug (URL)" hint="Bo'sh qoldirsangiz avtomatik yaratiladi">
        <input name="slug" defaultValue={service?.slug} className="input" />
      </Field>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Languages className="h-4 w-4 text-brand-500" />
          Xizmat matnlari (3 tilda)
        </div>
        <LanguageTabs>
          {(locale) => (
            <>
              <Field label="Xizmat nomi" required={locale === "uz"}>
                <input
                  required={locale === "uz"}
                  name={fieldName("title", locale)}
                  defaultValue={getField(service, "title", locale)}
                  className="input"
                />
              </Field>
              <Field label="Qisqacha tavsif" required={locale === "uz"}>
                <textarea
                  required={locale === "uz"}
                  name={fieldName("summary", locale)}
                  rows={2}
                  defaultValue={getField(service, "summary", locale)}
                  className="input resize-none"
                />
              </Field>
              <Field label="To'liq tavsif" required={locale === "uz"}>
                <textarea
                  required={locale === "uz"}
                  name={fieldName("description", locale)}
                  rows={6}
                  defaultValue={getField(service, "description", locale)}
                  className="input resize-none"
                />
              </Field>
            </>
          )}
        </LanguageTabs>
      </div>

      <Field label="Tartib raqami">
        <input type="number" name="order" defaultValue={service?.order ?? 0} className="input max-w-[160px]" />
      </Field>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Saqlash
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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-900">
        {label} {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
