"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteMediaAsset, deleteGalleryMediaItem } from "@/app/admin/actions/media";

export function MediaCard({
  id,
  url,
  label,
  type,
}: {
  id: string;
  url: string;
  label: string | null;
  type: "gallery" | "asset";
}) {
  const [pending, start] = useTransition();

  const isImage = /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(url);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
      <div className="relative aspect-square bg-[var(--color-border)]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label ?? "Media"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-muted)]">
            Non-image file
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        {label && (
          <p className="truncate text-xs text-[var(--color-muted)]" title={label}>
            {label}
          </p>
        )}
        <p className="truncate text-xs text-[var(--color-muted)] font-mono" title={url}>
          {url.split("/").pop()}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                toast.success("URL copied");
              } catch {
                toast.error("Could not copy");
              }
            }}
          >
            Copy URL
          </button>
          <button
            type="button"
            disabled={pending}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
            onClick={() => {
              if (!confirm("Delete this media item permanently?")) return;
              start(async () => {
                const r =
                  type === "gallery"
                    ? await deleteGalleryMediaItem(id)
                    : await deleteMediaAsset(id);
                if (r.ok) {
                  toast.success("Deleted");
                } else {
                  toast.error(r.error || "Failed to delete");
                }
              });
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
