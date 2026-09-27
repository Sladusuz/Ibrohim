"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImageOff, X } from "lucide-react";

export function ImageUploader({
  value,
  onChange,
  label = "Rasm yuklash",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Yuklashda xatolik.");
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklashda xatolik.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-ink-900">{label}</span>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {value ? (
            <>
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <ImageOff className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:border-brand-300 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Yuklanmoqda..." : "Fayl tanlash"}
          </button>
          <p className="mt-1.5 text-xs text-slate-400">PNG, JPG yoki WEBP, 5MB gacha</p>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
