import Link from "next/link";
import Image from "next/image";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { normalizeSiteImageUrl } from "@/lib/site-content";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { formatUkDate } from "@/lib/date-format";

export const dynamic = "force-dynamic";

export default async function MinutesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  type Row = {
    id: string;
    title: string;
    slug: string;
    body: string;
    external_url: string;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
    author_name: string | null;
  };
  let row: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT m.id, m.title, m.slug, m.body, m.external_url, m.cover_image_url, m.published_at, m.created_at,
        u.name AS author_name
      FROM site_minutes m
      LEFT JOIN users u ON u.id = m.author_id
      WHERE m.slug = ${slug} AND m.published_at IS NOT NULL AND m.published_at <= NOW()
        AND m.archived_at IS NULL
      LIMIT 1
    `;
    row = (rows[0] as Row) ?? null;
  } catch (err) {
    console.error("MinutesDetailPage DB fetch:", err);
  }
  if (!row) notFound();

  const session = await auth();
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;

  const safeHtml = sanitizeRichHtml(row.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/minutes" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Minutes
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-[var(--foreground)]">{row.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {row.published_at ? formatUkDate(row.published_at) : formatUkDate(row.created_at)}
        {row.author_name && ` · ${row.author_name}`}
      </p>

      <div className="mt-6">
        <a
          href={row.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:w-auto"
        >
          Open minutes document
        </a>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          You may leave this site to view or download the full minutes.
        </p>
      </div>

      {row.cover_image_url && (
        <div className="relative mt-8 h-64 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:h-[400px]">
          <Image
            src={normalizeSiteImageUrl(row.cover_image_url)}
            alt={row.title}
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      )}

      <div className="rich-content mt-8" dangerouslySetInnerHTML={{ __html: safeHtml }} />

      {showDonate && donationSettings && (
        <footer className="mt-12 border-t border-[var(--color-border)] pt-8">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Support The Association
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            If you would like to help fund our work in the Community, you can donate by bank transfer.
          </p>
          <div className="mt-3">
            <DonateButton
              variant="signature"
              details={{
                bankName: donationSettings.bankName,
                sortCode: donationSettings.sortCode,
                accountNumber: donationSettings.accountNumber,
                accountName: donationSettings.accountName,
              }}
            />
          </div>
        </footer>
      )}
    </article>
  );
}
