import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui";

export async function Header() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-[var(--foreground)]"
        >
          Culcheth & Glazebury RA
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/news"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            News
          </Link>
          <Link
            href="/gallery"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            Gallery
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            Contact
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            About
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/forum"
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
              >
                Forum
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" className="text-sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
