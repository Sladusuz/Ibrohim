"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, AlertCircle, Languages } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LanguageTabs, fieldName } from "@/components/admin/language-tabs";
import { safeJsonParse } from "@/lib/utils";
import type { Project } from "@prisma/client";

function getField(project: Project | undefined, base: string, locale: "uz" | "ru" | "en") {
  if (!project) return "";
  const key = fieldName(base, locale) as keyof Project;
  return locale === "uz" ? (project[key] as string) : ((project[key] as string | null) ?? "");
}

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cover, setCover] = useState(project?.cover ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);

  const stackDefault = project ? safeJsonParse<string[]>(project.stack, []).join(", ") : "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!cover) {
      setError("Iltimos, muqova rasmini yuklang.");
      return;
    }

    setLoading(true);
    const data = new FormData(e.currentTarget);
    const str = (key: string) => (data.get(key) as string)?.trim() || "";

    const payload = {
      title: str("title"),
      slug: str("slug"),
      category: str("category"),
      summary: str("summary"),
      description: str("description"),
      titleRu: str("titleRu"),
      categoryRu: str("categoryRu"),
      summaryRu: str("summaryRu"),
      descriptionRu: str("descriptionRu"),
      titleEn: str("titleEn"),
      categoryEn: str("categoryEn"),
      summaryEn: str("summaryEn"),
      descriptionEn: str("descriptionEn"),
      client: str("client"),
      year: str("year"),
      duration: str("duration"),
      link: str("link"),
      cover,
      stack: str("stack")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      gallery: [cover],
      featured,
      order: Number(data.get("order")) || 0,
    };

    try {
      const url = project ? `/api/admin/projects/${project.id}` : "/api/admin/projects";
      const method = project ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Xatolik yuz berdi.");

      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <ImageUploader value={cover} onChange={setCover} label="Muqova rasmi" />

      <Field label="Slug (URL)" hint="Bo'sh qoldirsangiz avtomatik yaratiladi">
        <input name="slug" defaultValue={project?.slug} className="input" placeholder="mening-loyiham" />
      </Field>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Languages className="h-4 w-4 text-brand-500" />
          Loyiha matnlari (3 tilda)
        </div>
        <LanguageTabs>
          {(locale) => (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Loyiha nomi" required={locale === "uz"}>
                  <input
                    required={locale === "uz"}
                    name={fieldName("title", locale)}
                    defaultValue={getField(project, "title", locale)}
                    className="input"
                  />
                </Field>
                <Field label="Kategoriya" required={locale === "uz"} hint={locale !== "uz" ? "Masalan: Fintech" : undefined}>
                  <input
                    required={locale === "uz"}
                    name={fieldName("category", locale)}
                    defaultValue={getField(project, "category", locale)}
                    className="input"
                    placeholder="Fintech"
                  />
                </Field>
              </div>
              <Field label="Qisqacha tavsif" required={locale === "uz"}>
                <textarea
                  required={locale === "uz"}
                  name={fieldName("summary", locale)}
                  rows={2}
                  defaultValue={getField(project, "summary", locale)}
                  className="input resize-none"
                />
              </Field>
              <Field label="To'liq tavsif" required={locale === "uz"}>
                <textarea
                  required={locale === "uz"}
                  name={fieldName("description", locale)}
                  rows={6}
                  defaultValue={getField(project, "description", locale)}
                  className="input resize-none"
                />
              </Field>
            </>
          )}
        </LanguageTabs>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Mijoz">
          <input name="client" defaultValue={project?.client ?? ""} className="input" />
        </Field>
        <Field label="Yil">
          <input name="year" defaultValue={project?.year ?? ""} className="input" placeholder="2025" />
        </Field>
        <Field label="Davomiyligi">
          <input name="duration" defaultValue={project?.duration ?? ""} className="input" placeholder="6 oy" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Loyiha havolasi">
          <input name="link" defaultValue={project?.link ?? ""} className="input" placeholder="https://" />
        </Field>
        <Field label="Tartib raqami">
          <input type="number" name="order" defaultValue={project?.order ?? 0} className="input" />
        </Field>
      </div>

      <Field label="Texnologiyalar" hint="Vergul bilan ajrating: Next.js, PostgreSQL, AWS">
        <input name="stack" defaultValue={stackDefault} className="input" />
      </Field>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
        />
        <span className="text-sm font-medium text-ink-900">
          Bosh sahifada ko&apos;rsatish (tanlangan loyiha)
        </span>
      </label>

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
