import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getHeaderNewsCategories } from "@/lib/news-nav";
import { getSiteSettings } from "@/lib/site-settings";
import { NewsNav } from "@/components/NewsNav";
import { FacebookIconLink } from "@/components/FacebookIconLink";
import { hasNonFacebookSocialLinks, SocialIconLinks } from "@/components/SocialIconLinks";
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
    <header className="sticky top-0 z-50 border-b-2 border-b-[var(--color-header-border)] bg-[var(--color-header-bg)] text-white/90 shadow-md">
      <div className="relative mx-auto flex min-h-20 max-w-6xl items-center gap-4 px-4 sm:min-h-24 md:min-h-28 md:px-6">
        {/* Mobile: spacer matches hamburger width so logo can sit true centre */}
        <div className="w-10 shrink-0 md:hidden" aria-hidden />
        {/* Logo — centred on mobile (absolute), left-aligned from md */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 shrink-0 items-center rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:static md:left-auto md:top-auto md:translate-x-0 md:translate-y-0"
        >
          <span className="relative isolate h-[65px] w-[65px] shrink-0 overflow-hidden rounded-full border border-white/25 shadow-md ring-1 ring-black/20 sm:h-[88px] sm:w-[88px] md:h-[105px] md:w-[105px]">
            <Image
              src={logoSrc}
              alt="Culcheth &amp; Glazebury Residents Association"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 65px, (max-width: 1024px) 88px, 105px"
              priority
            />
          </span>
        </Link>

        {/* Desktop nav + mobile menu — Facebook: small square, inline with nav on desktop */}
        <div className="ml-auto flex items-center gap-2 md:gap-0">
          {social.facebook_url && (
            <div className="md:hidden">
              <FacebookIconLink href={social.facebook_url} variant="onDark" />
            </div>
          )}
          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden items-center justify-end gap-x-4 gap-y-2 text-sm md:flex md:flex-wrap">
              <Link
                href="/"
                className="font-medium text-white/90 transition-colors hover:text-white"
              >
                Home
              </Link>
              <NewsNav categories={newsCategories} tone="dark" />
              <Link
                href="/gallery"
                className="font-medium text-white/90 transition-colors hover:text-white"
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                className="font-medium text-white/90 transition-colors hover:text-white"
              >
                Contact
              </Link>
              <Link
                href="/about"
                className="font-medium text-white/90 transition-colors hover:text-white"
              >
                About
              </Link>
              {social.facebook_url && (
                <FacebookIconLink href={social.facebook_url} variant="onDark" />
              )}
              <div className="hidden items-center gap-4 border-l border-white/20 pl-4 lg:flex">
                <SocialIconLinks settings={social} variant="footer" />
              </div>
              {session?.user ? (
                <>
                  {showDonate && donationSettings && (
                    <DonateButton
                      variant="nav"
                      onDarkChrome
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
                    className="font-medium text-white/90 transition-colors hover:text-white"
                  >
                    Account
                  </Link>
                  <Link
                    href="/forum"
                    className="font-medium text-white/90 transition-colors hover:text-white"
                  >
                    Forum
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="font-medium text-[var(--color-primary-muted)] hover:text-white hover:underline"
                    >
                      Admin
                    </Link>
                  )}
                  <form action={signOutAction}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="text-sm text-white/85 hover:bg-white/10 hover:text-white"
                    >
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-sm text-white/85 hover:bg-white/10 hover:text-white"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="text-sm shadow-sm">Sign up</Button>
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
            tone="dark"
          />
        </div>
      </div>

      {/* Other social links — mobile only strip when configured */}
      {hasNonFacebookSocialLinks(social) && (
        <div className="mx-auto flex max-w-6xl justify-end border-t border-white/10 bg-[var(--color-header-bg)] px-4 py-2 md:hidden">
          <SocialIconLinks settings={social} variant="footer" />
        </div>
      )}
    </header>
  );
}
