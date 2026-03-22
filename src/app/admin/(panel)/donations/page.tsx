import { getDonationSettings } from "@/lib/donations";
import { DonationSettingsForm } from "./DonationSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const settings = (await getDonationSettings()) ?? {
    enabled: false,
    bankName: "",
    sortCode: "",
    accountNumber: "",
    accountName: "",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Donations
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Bank transfer only. When enabled, a subtle &quot;Donate&quot; link appears for signed-in
        users in the header, footer, and at the end of each news article. When disabled, donate
        links are hidden for everyone.
      </p>
      <DonationSettingsForm initial={settings} />
    </div>
  );
}
