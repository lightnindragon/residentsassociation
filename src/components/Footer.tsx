import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getSiteSettings } from "@/lib/site-settings";
import { SocialIconLinks } from "@/components/SocialIconLinks";
import { getHeaderLogoSrc } from "@/lib/branding";

export async function Footer() {
  const session = await auth();
  const donationSettings = await getDonationSettings();
  const showDonate =
    !!session?.user && donationSettings?.enabled === true;
  const social = await getSiteSettings();
  const logoSrc = getHeaderLogoSrc();

  return (
    <footer className="mt-auto border-t border-[var(--color-surface-strong)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:max-w-sm">
            <Link href="/" className="flex items-center gap-3 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--foreground)]">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/15 shadow-sm">
                <Image
                  src={logoSrc}
                  alt="Culcheth &amp; Glazebury Residents Association logo"
                  fill
                  className="object-cover object-center"
                  sizes="48px"
                />
              </span>
              <p className="font-heading text-sm font-medium leading-tight text-[var(--foreground)]">
                Culcheth & Glazebury<br />Residents Association
              </p>
            </Link>
            <div className="mt-2">
              <SocialIconLinks settings={social} />
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-muted)]">
            <Link
              href="/about"
              className="hover:text-[var(--foreground)] hover:underline"
            >
              About us
            </Link>
            <Link
              href="/terms"
              className="hover:text-[var(--foreground)] hover:underline"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[var(--foreground)] hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-[var(--foreground)] hover:underline"
            >
              Cookies
            </Link>
            <Link
              href="/contact"
              className="hover:text-[var(--foreground)] hover:underline"
            >
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
        <p className="mt-8 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} Culcheth & Glazebury Residents
          Association. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
