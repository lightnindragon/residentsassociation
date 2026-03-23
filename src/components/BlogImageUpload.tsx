"use client";

import { useState, useTransition } from "react";
import { uploadBlogImage } from "@/app/admin/actions/blog-images";
import { Button } from "@/components/ui";
import { toast } from "sonner";

export function BlogImageUpload({
  name,
  currentUrl,
  label = "Hero image (optional)",
}: {
  name: string;
  currentUrl?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState(currentUrl || "");
  const [pending, start] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    start(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const r = await uploadBlogImage(null, fd);
      if (r?.url) {
        setUrl(r.url);
        toast.success("Image uploaded");
      } else {
        toast.error(r?.error || "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {url && (
        <div className="relative max-w-md">
          <img src={url} alt="Hero" className="h-32 w-full rounded border border-[var(--color-border)] object-cover" />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              toast.info("Image cleared");
            }}
            className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={pending}
        className="block w-full cursor-pointer text-sm text-[var(--color-muted)] file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 disabled:opacity-50"
      />
      <input type="hidden" name={name} value={url} />
      {pending && <p className="text-xs text-[var(--color-muted)]">Uploading…</p>}
    </div>
  );
}
