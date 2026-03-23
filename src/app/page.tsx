import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardHeader, CardContent } from "@/components/ui";
import { auth } from "@/lib/auth";
import { getHomeHeroImageUrl, normalizeSiteImageUrl } from "@/lib/site-content";
import { getSql } from "@/lib/db";

export default async function HomePage() {
  const session = await auth();
  const heroUrl = await getHomeHeroImageUrl();

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
      WHERE published_at IS NOT NULL AND published_at <= NOW()
      ORDER BY published_at DESC
      LIMIT 3
    `) as typeof latestNews;
  } catch {
    // no DB
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        {heroUrl ? (
          <div className="relative mx-auto aspect-[21/9] max-h-[min(45vh,420px)] w-full max-w-6xl sm:aspect-[3/1] sm:max-h-[min(50vh,480px)]">
            <Image
              src={heroUrl}
              alt="Culcheth area — community photograph"
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
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Culcheth & Glazebury
          </h1>
          <p className="mt-3 text-xl text-[var(--color-muted)]">Residents Association</p>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]">
            Your community hub for local news, events and discussion. Stay informed and get involved.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/news">
              <Button className="min-w-[140px]">Latest news</Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" className="min-w-[140px]">
                Gallery
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="min-w-[140px]">
                Contact us
              </Button>
            </Link>
            {session?.user ? (
              <Link href="/forum">
                <Button variant="ghost" className="min-w-[140px]">
                  Forum
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Latest News</h2>
          <Link href="/news">
            <Button variant="outline" className="px-3 py-1.5 text-sm h-auto">View all news</Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((p) => {
            const imageUrl = normalizeSiteImageUrl(p.cover_image_url || "");
            return (
              <Link key={p.id} href={`/news/${p.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md overflow-hidden flex flex-col">
                  {imageUrl && (
                    <div className="relative h-48 w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                      <Image
                        src={imageUrl}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <CardHeader className="flex-none pb-2">{p.title}</CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="line-clamp-3 text-sm text-[var(--color-muted)]">
                        {p.excerpt || "No excerpt."}
                      </p>
                      <span className="mt-4 block text-xs font-medium text-[var(--color-primary)]">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString()
                          : new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-card)]/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)] text-center">Get involved</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {session?.user ? (
              <Link href="/forum">
                <Card className="h-full bg-transparent transition-shadow hover:shadow-md">
                  <CardHeader>Residents forum</CardHeader>
                  <CardContent>
                    Join the conversation and take part in community discussions.
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/forum">
                <Card className="h-full bg-transparent transition-shadow hover:shadow-md">
                  <CardHeader>Residents forum</CardHeader>
                  <CardContent>
                    Sign in to view and take part in community discussions.
                  </CardContent>
                </Card>
              </Link>
            )}
            <Link href="/gallery">
              <Card className="h-full bg-transparent transition-shadow hover:shadow-md">
                <CardHeader>Gallery</CardHeader>
                <CardContent>Browse photos from local events and the area.</CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
