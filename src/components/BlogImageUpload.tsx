"use client";

import { useState, useTransition } from "react";
import { uploadBlogImage } from "@/app/admin/actions/blog-images";
import { toast } from "sonner";
import { ADMIN_COVER_IMAGE_HINT } from "@/lib/image-specs";

export function BlogImageUpload({
  name,
  currentUrl,
  label = "Cover image (optional)",
  sizeHint = ADMIN_COVER_IMAGE_HINT,
}: {
  name: string;
  currentUrl?: string | null;
  label?: string;
  /** Shown in red under the label — omit by passing empty string to hide */
  sizeHint?: string;
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
      {sizeHint ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-500">{sizeHint}</p>
      ) : null}
      {url && (
        <div className="relative flex h-40 w-full max-w-md items-center justify-center overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-border)]">
          <img src={url} alt="Preview" className="max-h-full max-w-full object-contain" />
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
