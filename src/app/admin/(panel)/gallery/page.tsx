import { getSql } from "@/lib/db";
import Image from "next/image";
import { UploadForm } from "./UploadForm";
import { DeleteButton } from "./DeleteButton";

export default async function AdminGalleryPage() {
  let images: Array<{
    id: string;
    url: string;
    caption: string | null;
    uploaded_at: string;
  }> = [];
  try {
    const sql = getSql();
    images = (await sql`
      SELECT id, url, caption, uploaded_at
      FROM gallery_images
      ORDER BY uploaded_at DESC
      LIMIT 100
    `) as typeof images;
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Gallery
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Upload images. They appear on the public gallery page.
      </p>
      <UploadForm />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-lg border border-[var(--color-border)]"
          >
            <div className="relative aspect-square bg-[var(--color-border)]">
              <Image
                src={img.url}
                alt={img.caption ?? "Gallery"}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="truncate text-xs text-[var(--color-muted)]">
                {img.caption || "No caption"}
              </span>
              <DeleteButton imageId={img.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
