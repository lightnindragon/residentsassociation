import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDonationSettings } from "@/lib/donations";
import { DonateButton } from "@/components/DonateButton";
import { getSiteSettings } from "@/lib/site-settings";
import { SocialIconLinks } from "@/components/SocialIconLinks";

export async function Footer() {
  const session = await auth();
  const donationSettings = await getDonationSettings();
  const showDonate =
    !!session?.user && donationSettings?.enabled === true;
  const social = await getSiteSettings();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-sm font-medium text-[var(--foreground)]">
              Culcheth & Glazebury Residents Association
            </p>
            <div className="mt-4">
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
