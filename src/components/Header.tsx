import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getHeaderNewsCategories, type HeaderNewsCategory } from "@/lib/news-nav";
import { getSiteSettings } from "@/lib/site-settings";
import { NewsNav } from "@/components/NewsNav";
import { FacebookIconLink } from "@/components/FacebookIconLink";
import { hasNonFacebookSocialLinks, SocialIconLinks } from "@/components/SocialIconLinks";
import { getHeaderLogoSrc } from "@/lib/branding";
import { MobileNav } from "@/components/MobileNav";

const navLink =
  "font-medium text-[var(--color-chrome-foreground)] transition-colors hover:text-[var(--color-primary)]";

function PrimaryNav({
  categories,
  className = "",
}: {
  categories: HeaderNewsCategory[];
  className?: string;
}) {
  return (
    <nav className={className} aria-label="Primary">
      <Link href="/" className={navLink}>
        Home
      </Link>
      <NewsNav categories={categories} />
      <Link href="/planning-applications" className={navLink}>
        Planning
      </Link>
      <Link href="/agendas" className={navLink}>
        Agendas
      </Link>
      <Link href="/minutes" className={navLink}>
        Minutes
      </Link>
      <Link href="/events" className={navLink}>
        Events
      </Link>
      <Link href="/about" className={navLink}>
        About
      </Link>
      <Link href="/contact" className={navLink}>
        Contact
      </Link>
      <Link href="/gallery" className={navLink}>
        Gallery
      </Link>
    </nav>
  );
}

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

  const logo = (
    <Link
      href="/"
      className="flex shrink-0 items-center rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-chrome-foreground)]"
    >
      <span className="relative isolate h-[65px] w-[65px] shrink-0 overflow-hidden rounded-full border border-black/15 shadow-sm ring-1 ring-black/10 sm:h-[88px] sm:w-[88px] md:h-[88px] md:w-[88px] lg:h-[105px] lg:w-[105px]">
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
  );

  const rightCluster = (
    <>
      {social.facebook_url && <FacebookIconLink href={social.facebook_url} variant="blue" />}
      <div className="hidden items-center gap-4 border-l border-black/15 pl-4 lg:flex">
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
          <Link href="/account" className={navLink}>
            Account
          </Link>
          <Link href="/forum" className={navLink}>
            Forum
          </Link>
          {isAdmin && (
            <Link href="/admin" className="font-medium text-[var(--color-primary)] hover:underline">
              Admin
            </Link>
          )}
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="text-sm text-[var(--color-chrome-foreground)] hover:bg-black/5 hover:text-[var(--color-primary)]"
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
              className="text-sm text-[var(--color-chrome-foreground)] hover:bg-black/5 hover:text-[var(--color-primary)]"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="text-sm shadow-sm">Sign up</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b-2 border-b-[var(--color-header-border)] bg-[var(--color-header-bg)] text-[var(--color-chrome-foreground)] shadow-sm">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile: logo centre, FB + menu right */}
        <div className="relative flex min-h-20 items-center sm:min-h-24 md:hidden">
          <div className="w-10 shrink-0" aria-hidden />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto">{logo}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {social.facebook_url && <FacebookIconLink href={social.facebook_url} variant="blue" />}
            <MobileNav
              isLoggedIn={!!session?.user}
              isAdmin={isAdmin}
              categories={newsCategories}
              signOutAction={signOutAction}
            />
          </div>
        </div>

        {/* Desktop: primary nav left — logo centre — account & social right */}
        <div className="hidden min-h-24 items-center gap-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6 lg:min-h-28">
          <PrimaryNav
            categories={newsCategories}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm justify-self-start lg:gap-x-4"
          />
          <div className="justify-self-center">{logo}</div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm justify-self-end lg:gap-x-4">
            {rightCluster}
          </div>
        </div>
      </div>

      {hasNonFacebookSocialLinks(social) && (
        <div className="mx-auto flex max-w-6xl justify-end border-t border-black/10 bg-[var(--color-header-bg)] px-4 py-2 md:hidden">
          <SocialIconLinks settings={social} />
        </div>
      )}
    </header>
  );
}
