import { getSql } from "@/lib/db";
import { MediaUploadForm } from "./MediaUploadForm";
import { MediaCard } from "./MediaCard";

export default async function AdminMediaPage() {
  type G = { id: string; url: string; caption: string | null };
  let gallery: G[] = [];
  let assets: Array<{ id: string; url: string; label: string | null; source: string; created_at: string }> = [];
  try {
    const sql = getSql();
    gallery = (await sql`
      SELECT id::text, url, caption FROM gallery_images ORDER BY uploaded_at DESC LIMIT 200
    `) as G[];
    assets = (await sql`
      SELECT id::text, url, label, source, created_at::text FROM media_assets ORDER BY created_at DESC LIMIT 200
    `) as typeof assets;
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Media Library</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Upload, browse and manage all your images. Copy a URL to reuse in news or elsewhere.
      </p>

      <MediaUploadForm />

      <h2 className="mt-10 font-heading text-lg font-semibold">Gallery Images</h2>
      {gallery.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">No gallery images.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((g) => (
            <MediaCard
              key={g.id}
              id={g.id}
              url={g.url}
              label={g.caption}
              type="gallery"
            />
          ))}
        </div>
      )}

      <h2 className="mt-10 font-heading text-lg font-semibold">Media Assets</h2>
      {assets.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">No media assets uploaded yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <MediaCard
              key={a.id}
              id={a.id}
              url={a.url}
              label={a.label}
              type="asset"
            />
          ))}
        </div>
      )}
    </div>
  );
}
