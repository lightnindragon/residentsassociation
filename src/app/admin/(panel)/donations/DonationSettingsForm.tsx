"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDonationSettings } from "@/app/admin/actions/donations";
import type { DonationSettings } from "@/lib/donations";

export function DonationSettingsForm({ initial }: { initial: DonationSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [bankName, setBankName] = useState(initial.bankName);
  const [sortCode, setSortCode] = useState(initial.sortCode);
  const [accountNumber, setAccountNumber] = useState(initial.accountNumber);
  const [accountName, setAccountName] = useState(initial.accountName);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveDonationSettings({
        enabled,
        bankName,
        sortCode,
        accountNumber,
        accountName,
      });
      if (result.ok) {
        setMessage("saved");
        router.refresh();
      } else {
        setMessage("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm font-medium text-[var(--foreground)]">
          Enable donate buttons for signed-in users
        </span>
      </label>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Bank name</label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Sort code</label>
        <input
          type="text"
          value={sortCode}
          onChange={(e) => setSortCode(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Account number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Account name</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message === "saved" && (
          <span className="text-sm text-[var(--color-primary)]">Saved.</span>
        )}
        {message === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">Failed to save.</span>
        )}
      </div>
    </form>
  );
}
