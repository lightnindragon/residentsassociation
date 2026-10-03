import Image from "next/image";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { normalizeSiteImageUrl } from "@/lib/site-content";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { RESERVED_PAGE_SLUGS } from "@/lib/site-pages";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
};

async function getPublishedPage(slug: string): Promise<Row | null> {
  if (!slug || RESERVED_PAGE_SLUGS.has(slug)) return null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, slug, body, cover_image_url
      FROM site_pages
      WHERE slug = ${slug} AND published_at IS NOT NULL AND published_at <= NOW()
      LIMIT 1
    `;
    return (rows[0] as Row) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getPublishedPage(slug);
  if (!row) return { title: "Page not found" };
  return { title: `${row.title} · Culcheth & Glazebury Residents Association` };
}

export default async function CustomSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getPublishedPage(slug);
  if (!row) notFound();

  const session = await auth();
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;
  const safeHtml = sanitizeRichHtml(row.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">{row.title}</h1>
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
