import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getHeaderNewsCategories } from "@/lib/news-nav";
import { getSiteSettings } from "@/lib/site-settings";
import { NewsNav } from "@/components/NewsNav";
import { SocialIconLinks } from "@/components/SocialIconLinks";

export async function Header() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "dev";
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;
  const newsCategories = await getHeaderNewsCategories();
  const social = await getSiteSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-card)]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-heading text-xl font-semibold text-[var(--foreground)]"
        >
          Culcheth & Glazebury RA
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
          <NewsNav categories={newsCategories} />
          <Link
            href="/gallery"
            className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            Gallery
          </Link>
          <Link
            href="/contact"
            className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            Contact
          </Link>
          <Link
            href="/about"
            className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            About
          </Link>
          <div className="hidden items-center gap-4 border-l border-[var(--color-border)] pl-4 sm:flex">
            <SocialIconLinks settings={social} />
          </div>
          {session?.user ? (
            <>
              {showDonate && donationSettings && (
                <DonateButton
                  variant="nav"
                  details={{
                    bankName: donationSettings.bankName,
                    sortCode: donationSettings.sortCode,
                    accountNumber: donationSettings.accountNumber,
                    accountName: donationSettings.accountName,
                  }}
                />
              )}
              <Link
                href="/account"
                className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
              >
                Account
              </Link>
              <Link
                href="/enquiries"
                className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
              >
                My enquiries
              </Link>
              <Link
                href="/forum"
                className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
              >
                Forum
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-medium text-[var(--color-primary)] hover:underline"
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
      <div className="mx-auto flex max-w-6xl justify-end border-t border-[var(--color-border)] px-4 py-2 sm:hidden">
        <SocialIconLinks settings={social} />
      </div>
    </header>
  );
}
