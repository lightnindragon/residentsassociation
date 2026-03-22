import Link from "next/link";
import { Button, Card, CardHeader, CardContent } from "@/components/ui";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-card)] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
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

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Get involved</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link href="/news">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>News & updates</CardHeader>
              <CardContent>
                Read the latest community news and announcements from the association.
              </CardContent>
            </Card>
          </Link>
          {session?.user ? (
            <Link href="/forum">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>Residents forum</CardHeader>
                <CardContent>
                  Join the conversation and take part in community discussions.
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Link href="/login?callbackUrl=/forum">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>Residents forum</CardHeader>
                <CardContent>
                  Sign in to view and take part in community discussions.
                </CardContent>
              </Card>
            </Link>
          )}
          <Link href="/gallery">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>Gallery</CardHeader>
              <CardContent>Browse photos from local events and the area.</CardContent>
            </Card>
          </Link>
          <Link href="/contact">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>Contact</CardHeader>
              <CardContent>
                Get in touch with the committee or send a message to the association.
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
