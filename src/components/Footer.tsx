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
    <footer className="mt-auto border-t-2 border-[var(--color-footer-border)] bg-[var(--color-footer-bg)] text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-3 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/20 shadow-md">
                <Image
                  src={logoSrc}
                  alt="Culcheth &amp; Glazebury Residents Association logo"
                  fill
                  className="object-cover object-center"
                  sizes="48px"
                />
              </span>
              <p className="font-heading text-sm font-medium leading-tight text-white">
                Culcheth & Glazebury<br />Residents Association
              </p>
            </Link>
            <div className="mt-1">
              <SocialIconLinks settings={social} />
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
            <Link href="/about" className="hover:text-white transition-colors">About us</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
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

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Culcheth & Glazebury Residents Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
