import { getSql } from "@/lib/db";
import { normalizeSiteImageUrl } from "@/lib/site-content";
import { formatUkDate } from "@/lib/date-format";
import Image from "next/image";

export default async function GalleryPage() {
  let images: Array<{
    id: string;
    url: string;
    caption: string | null;
    uploaded_at: string;
  }> = [];
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, url, caption, uploaded_at
      FROM gallery_images
      ORDER BY uploaded_at DESC
      LIMIT 100
    `) as typeof images;
    images = rows.map((img) => ({
      ...img,
      url: normalizeSiteImageUrl(img.url),
    }));
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Gallery
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Photos from the Community and local events.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.length === 0 ? (
          <p className="col-span-full text-[var(--color-muted)]">
            No images yet.
          </p>
        ) : (
          images.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <div className="relative aspect-[4/3] bg-[var(--color-border)]">
                <Image
                  src={img.url}
                  alt={img.caption ?? "Gallery image"}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {(img.caption || img.uploaded_at) && (
                <figcaption className="p-3 text-sm text-[var(--color-muted)]">
                  {img.caption}
                  <span className="block text-xs">
                    {formatUkDate(img.uploaded_at)}
                  </span>
                </figcaption>
              )}
            </figure>
          ))
        )}
      </div>
    </div>
  );
}
