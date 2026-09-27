"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { ButtonEl } from "@/components/ui/button";

const SERVICES = [
  "Veb-sayt yaratish",
  "Mobil ilova",
  "UI/UX dizayn",
  "E-commerce",
  "Backend / Bulut",
  "Sun'iy intellekt",
  "Boshqa",
];

const BUDGETS = [
  "$1,000 — $5,000",
  "$5,000 — $15,000",
  "$15,000 — $50,000",
  "$50,000+",
  "Hali aniq emas",
];

export function ContactForm() {
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
        throw new Error(json.error || "Xatolik yuz berdi.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Xatolik yuz berdi.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 px-8 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="font-display mt-5 text-2xl font-bold text-ink-900">
          Rahmat! Xabaringiz qabul qilindi
        </h3>
        <p className="mt-2 max-w-sm text-slate-500">
          Jamoamiz tez orada siz bilan bog&apos;lanadi. Odatda 24 soat ichida javob
          beramiz.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-600 hover:underline"
        >
          Yana xabar yuborish
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
        <Field label="Ismingiz" required>
          <input
            required
            name="name"
            type="text"
            placeholder="Alisher Navoiy"
            className="input"
          />
        </Field>
        <Field label="Email" required>
          <input
            required
            name="email"
            type="email"
            placeholder="siz@company.uz"
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telefon raqami">
          <input name="phone" type="tel" placeholder="+998 90 123 45 67" className="input" />
        </Field>
        <Field label="Kerakli xizmat">
          <select name="service" defaultValue="" className="input">
            <option value="" disabled>
              Xizmatni tanlang
            </option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Taxminiy byudjet">
        <select name="budget" defaultValue="" className="input">
          <option value="" disabled>
            Byudjetni tanlang
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Loyihangiz haqida" required>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Loyihangiz haqida qisqacha ma'lumot bering..."
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
            Yuborilmoqda...
          </>
        ) : (
          <>
            Xabarni yuborish
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
