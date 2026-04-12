import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardHeader, CardContent } from "@/components/ui";
import { auth } from "@/lib/auth";
import { getHomeHeroImageUrl, getHomePageContent, normalizeSiteImageUrl } from "@/lib/site-content";
import { getSql } from "@/lib/db";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { formatUkDate } from "@/lib/date-format";

export default async function HomePage() {
  const session = await auth();
  const [heroUrl, homeContent] = await Promise.all([getHomeHeroImageUrl(), getHomePageContent()]);
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;

  let latestNews: Array<{
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
    latestNews = (await sql`
      SELECT id, title, slug, excerpt, cover_image_url, published_at, created_at
      FROM posts
      WHERE published_at IS NOT NULL AND published_at <= NOW() AND archived_at IS NULL
      ORDER BY published_at DESC
      LIMIT 3
    `) as typeof latestNews;
  } catch {
    // no DB
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-[var(--color-surface-strong)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--background)]">
        {heroUrl ? (
          <div className="relative mx-auto aspect-[21/9] max-h-[min(45vh,420px)] w-full max-w-6xl overflow-hidden sm:aspect-[3/1] sm:max-h-[min(50vh,480px)]">
            <Image
              src={heroUrl}
              alt={homeContent.heroImageAlt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority
            />
          </div>
        ) : null}
        <div
          className={`mx-auto max-w-3xl px-4 text-center sm:px-6 ${heroUrl ? "py-12 sm:py-16" : "py-16 sm:py-24"}`}
        >
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            <span className="block">Culcheth & Glazebury</span>
            <span className="mt-2 block sm:mt-3">Residents Association</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]">{homeContent.intro}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/news">
              <Button className="min-w-[140px]">Latest News</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="min-w-[140px]">
                Contact Us
              </Button>
            </Link>
            {showDonate && donationSettings && (
              <DonateButton
                variant="hero"
                details={{
                  bankName: donationSettings.bankName,
                  sortCode: donationSettings.sortCode,
                  accountNumber: donationSettings.accountNumber,
                  accountName: donationSettings.accountName,
                }}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
            Latest News
          </h2>
          <Link href="/news">
            <Button variant="outline" className="h-auto px-3 py-1.5 text-sm">
              View All News
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((p) => {
            const imageUrl = normalizeSiteImageUrl(p.cover_image_url || "");
            return (
              <Link key={p.id} href={`/news/${p.slug}`}>
                <Card className="flex h-full flex-col overflow-hidden border-t-[3px] border-t-[var(--color-primary)] transition-all hover:shadow-lg hover:-translate-y-0.5">
                  {imageUrl && (
                    <div className="relative h-48 w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-border)]">
                      <Image
                        src={imageUrl}
                        alt={p.title}
                        fill
                        className="object-contain object-center"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <CardHeader className="flex-none pb-2">{p.title}</CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between">
                      <p className="line-clamp-3 text-sm text-[var(--color-muted)]">
                        {p.excerpt || "No excerpt."}
                      </p>
                      <span className="mt-4 block text-xs font-medium text-[var(--color-primary)]">
                        {p.published_at
                          ? formatUkDate(p.published_at)
                          : formatUkDate(p.created_at)}
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-semibold text-[var(--foreground)]">
            {homeContent.getInvolvedTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            {homeContent.getInvolvedSubtitle}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {session?.user ? (
              <Link href="/forum">
                <Card className="h-full border-2 border-[var(--color-surface-strong)] bg-white transition-all hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>Residents Forum</CardHeader>
                  <CardContent>
                    Join the conversation and take part in Community discussions.
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/forum">
                <Card className="h-full border-2 border-[var(--color-surface-strong)] bg-white transition-all hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>Residents Forum</CardHeader>
                  <CardContent>
                    Sign in to view and take part in Community discussions.
                  </CardContent>
                </Card>
              </Link>
            )}
            <Link href="/gallery">
              <Card className="h-full border-2 border-[var(--color-surface-strong)] bg-white transition-all hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-1">
                <CardHeader>Gallery</CardHeader>
                <CardContent>
                  Browse photos from local events and the area.
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
