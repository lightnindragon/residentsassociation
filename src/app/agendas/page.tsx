import Link from "next/link";
import Image from "next/image";
import { getSql } from "@/lib/db";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { normalizeSiteImageUrl } from "@/lib/site-content";
import { formatUkDate } from "@/lib/date-format";

export default async function AgendasPage() {
  let agendas: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    agendas = (await sql`
      SELECT id, title, slug, excerpt, cover_image_url, published_at, created_at
      FROM site_agendas
      WHERE published_at IS NOT NULL AND published_at <= NOW() AND archived_at IS NULL
      ORDER BY published_at DESC
      LIMIT 50
    `) as typeof agendas;
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 border-l-4 border-[var(--color-primary)] pl-4">
        <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">Agendas</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Meeting agendas from the Residents Association, with links to full documents where
          available.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {agendas.length === 0 ? (
          <p className="text-[var(--color-muted)]">No agendas published yet.</p>
        ) : (
          agendas.map((p) => {
            const imageUrl = normalizeSiteImageUrl(p.cover_image_url || "");
            return (
              <Link key={p.id} href={`/agendas/${p.slug}`}>
                <Card className="overflow-hidden border-t-[3px] border-t-[var(--color-primary)] transition-all hover:shadow-md hover:-translate-y-0.5">
                  {imageUrl && (
                    <div className="relative h-48 w-full border-b border-[var(--color-border)] bg-[var(--color-border)] sm:h-64">
                      <Image
                        src={imageUrl}
                        alt={p.title}
                        fill
                        className="object-contain object-center"
                      />
                    </div>
                  )}
                  <CardHeader>{p.title}</CardHeader>
                  <CardContent>
                    {p.excerpt || "Read more for details and the agenda link."}
                    <span className="mt-2 block text-xs text-[var(--color-muted)]">
                      {p.published_at
                        ? formatUkDate(p.published_at)
                        : formatUkDate(p.created_at)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
