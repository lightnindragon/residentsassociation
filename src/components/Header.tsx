import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getHeaderNewsCategories } from "@/lib/news-nav";
import { getSiteSettings } from "@/lib/site-settings";
import { NewsNav } from "@/components/NewsNav";
import { SocialIconLinks } from "@/components/SocialIconLinks";
import { getHeaderLogoSrc } from "@/lib/branding";
import { MobileNav } from "@/components/MobileNav";

export async function Header() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "dev";
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;
  const newsCategories = await getHeaderNewsCategories();
  const social = await getSiteSettings();
  const logoSrc = getHeaderLogoSrc();

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-t-[3px] border-t-[var(--color-primary)] border-b border-b-[var(--color-border)] bg-white/97 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 md:h-24 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--foreground)]"
        >
          <span className="relative isolate h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border border-black/15 shadow-sm sm:h-[70px] sm:w-[70px] md:h-[84px] md:w-[84px]">
            <Image
              src={logoSrc}
              alt="Culcheth &amp; Glazebury Residents Association"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 52px, (max-width: 1024px) 70px, 84px"
              priority
            />
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center justify-end gap-x-4 gap-y-2 text-sm md:flex md:flex-wrap">
          <Link
            href="/"
            className="font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
          >
            Home
          </Link>
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
          <div className="hidden items-center gap-4 border-l border-[var(--color-border)] pl-4 lg:flex">
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
              <form action={signOutAction}>
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

        {/* Mobile hamburger — visible only on mobile */}
        <MobileNav
          isLoggedIn={!!session?.user}
          isAdmin={isAdmin}
          categories={newsCategories}
          signOutAction={signOutAction}
        />
      </div>

      {/* Social icons strip — shown below header on mobile */}
      <div className="mx-auto flex max-w-6xl justify-end border-t border-[var(--color-surface-strong)] px-4 py-1.5 md:hidden">
        <SocialIconLinks settings={social} />
      </div>
    </header>
  );
}
