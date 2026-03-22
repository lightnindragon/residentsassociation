import { getSql } from "@/lib/db";
import { CopyUrlButton } from "./CopyUrlButton";

export default async function AdminMediaPage() {
  type G = { id: string; url: string; caption: string | null; source: string };
  let gallery: G[] = [];
  let assets: Array<{ id: string; url: string; label: string | null; source: string; created_at: string }> = [];
  try {
    const sql = getSql();
    gallery = (await sql`
      SELECT id::text, url, caption, 'gallery'::text AS source FROM gallery_images ORDER BY uploaded_at DESC LIMIT 200
    `) as G[];
    assets = (await sql`
      SELECT id::text, url, label, source, created_at::text FROM media_assets ORDER BY created_at DESC LIMIT 200
    `) as typeof assets;
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Media library</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Gallery uploads and tracked blob URLs. Copy a link to reuse in news or elsewhere.
      </p>
      <h2 className="mt-8 font-heading text-lg font-semibold">Gallery</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {gallery.length === 0 ? (
          <li className="text-[var(--color-muted)]">No gallery images.</li>
        ) : (
          gallery.map((g) => (
            <li key={g.id} className="flex flex-col gap-1 rounded border border-[var(--color-border)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-all text-[var(--color-muted)]">{g.url}</span>
              <CopyUrlButton url={g.url} />
            </li>
          ))
        )}
      </ul>
      <h2 className="mt-10 font-heading text-lg font-semibold">Media assets</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {assets.length === 0 ? (
          <li className="text-[var(--color-muted)]">No extra assets yet (new uploads also log here when supported).</li>
        ) : (
          assets.map((a) => (
            <li key={a.id} className="rounded border border-[var(--color-border)] p-3">
              <span className="text-xs text-[var(--color-muted)]">{a.source}</span>
              <p className="break-all">{a.url}</p>
              {a.label && <p className="text-xs text-[var(--color-muted)]">{a.label}</p>}
            </li>
          ))
        )}
      </ul>
      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Tip: “Copy URL” requires a secure context; you can also select and copy manually.
      </p>
    </div>
  );
}
