"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { ButtonEl } from "@/components/ui/button";

export function ContactForm() {
  const t = useTranslations("contactForm");
  const services = t.raw("services") as string[];
  const budgets = t.raw("budgets") as string[];

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || t("genericError"));
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("genericError"));
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 px-8 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="font-display mt-5 text-2xl font-bold text-ink-900">
          {t("successTitle")}
        </h3>
        <p className="mt-2 max-w-sm text-slate-500">{t("successDescription")}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-600 hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} required>
          <input
            required
            name="name"
            type="text"
            placeholder={t("namePlaceholder")}
            className="input"
          />
        </Field>
        <Field label={t("email")} required>
          <input
            required
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("phone")}>
          <input name="phone" type="tel" placeholder={t("phonePlaceholder")} className="input" />
        </Field>
        <Field label={t("service")}>
          <select name="service" defaultValue="" className="input">
            <option value="" disabled>
              {t("servicePlaceholder")}
            </option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("budget")}>
        <select name="budget" defaultValue="" className="input">
          <option value="" disabled>
            {t("budgetPlaceholder")}
          </option>
          {budgets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("message")} required>
        <textarea
          required
          name="message"
          rows={5}
          placeholder={t("messagePlaceholder")}
          className="input resize-none"
        />
      </Field>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <ButtonEl
        type="submit"
        variant="secondary"
        size="lg"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          <>
            {t("submit")}
            <Send className="h-4 w-4" />
          </>
        )}
      </ButtonEl>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.85rem;
          border: 1px solid var(--color-slate-200);
          background: white;
          padding: 0.75rem 1rem;
          font-size: 0.925rem;
          color: var(--foreground);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-brand-500);
          box-shadow: 0 0 0 3px rgba(20, 179, 209, 0.15);
        }
        .input::placeholder {
          color: var(--color-slate-400);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-900">
        {label} {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
    </label>
  );
}
