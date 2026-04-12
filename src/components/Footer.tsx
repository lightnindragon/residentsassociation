import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getSiteSettings } from "@/lib/site-settings";
import { FacebookIconLink } from "@/components/FacebookIconLink";
import { SocialIconLinks } from "@/components/SocialIconLinks";
import { getHeaderLogoSrc } from "@/lib/branding";
import { getPublicContactEmail } from "@/lib/email";

const footLink =
  "transition-colors text-[var(--color-chrome-muted)] hover:text-[var(--color-chrome-foreground)]";

export async function Footer() {
  const session = await auth();
  const donationSettings = await getDonationSettings();
  const showDonate = !!session?.user && donationSettings?.enabled === true;
  const social = await getSiteSettings();
  const logoSrc = getHeaderLogoSrc();
  const contactEmail = await getPublicContactEmail();

  return (
    <footer className="mt-auto border-t-2 border-[var(--color-footer-border)] bg-[var(--color-footer-bg)] text-[var(--color-chrome-foreground)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-3 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-chrome-foreground)]"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/15 shadow-sm ring-1 ring-black/10">
                <Image
                  src={logoSrc}
                  alt="Culcheth &amp; Glazebury Residents Association logo"
                  fill
                  className="object-cover object-center"
                  sizes="48px"
                />
              </span>
              <p className="font-heading text-sm font-medium leading-tight text-[var(--color-chrome-foreground)]">
                Culcheth & Glazebury<br />Residents Association
              </p>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {social.facebook_url && (
                <FacebookIconLink href={social.facebook_url} variant="blue" />
              )}
              <SocialIconLinks settings={social} />
            </div>
            {contactEmail && (
              <p className="mt-3 text-sm text-[var(--color-chrome-muted)]">
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-[var(--color-chrome-foreground)] underline underline-offset-2 transition-colors hover:text-[var(--color-primary)]"
                >
                  {contactEmail}
                </a>
              </p>
            )}
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link href="/about" className={footLink}>
              About us
            </Link>
            <Link href="/terms" className={footLink}>
              Terms & Conditions
            </Link>
            <Link href="/privacy" className={footLink}>
              Privacy
            </Link>
            <Link href="/cookies" className={footLink}>
              Cookies
            </Link>
            <Link href="/contact" className={footLink}>
              Contact
            </Link>
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
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-chrome-muted)]">
            © {new Date().getFullYear()} Culcheth & Glazebury Residents Association. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-chrome-muted)]">
            Custom designed by{" "}
            <a
              href="https://webdesigns-uk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-chrome-foreground)]/80 underline underline-offset-2 hover:text-[var(--color-primary)] transition-colors"
            >
              Web Designs UK
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
