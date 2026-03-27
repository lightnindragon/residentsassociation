"use client";

import { useRef, useState } from "react";

export type DonateDetails = {
  bankName: string;
  sortCode: string;
  accountNumber: string;
  accountName: string;
};

type Props = {
  details: DonateDetails;
  /** "nav" = header/footer link style; "signature" = blog post block; "hero" = homepage button */
  variant?: "nav" | "signature" | "hero";
};

export function DonateButton({ details, variant = "nav" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function copy(label: string, text: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  }

  const btnClass =
    variant === "hero"
      ? "min-w-[140px] inline-flex items-center justify-center rounded-md border border-[var(--color-primary)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
      : variant === "signature"
        ? "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5"
        : "text-sm font-medium text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-primary)] hover:underline";

  return (
    <>
      <button type="button" onClick={open} className={btnClass}>
        {variant === "signature" ? "Donate by bank transfer" : "Donate"}
      </button>
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-0 text-[var(--foreground)] shadow-xl backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">Support the RA</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Thank you. Please use the details below for a bank transfer.
          </p>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm">
          <DetailRow
            label="Bank"
            copyKey="bank"
            value={details.bankName}
            copied={copied}
            onCopy={() => copy("bank", details.bankName)}
          />
          <DetailRow
            label="Sort code"
            copyKey="sort"
            value={details.sortCode}
            copied={copied}
            onCopy={() => copy("sort", details.sortCode)}
          />
          <DetailRow
            label="Account number"
            copyKey="acct"
            value={details.accountNumber}
            copied={copied}
            onCopy={() => copy("acct", details.accountNumber)}
          />
          <DetailRow
            label="Account name"
            copyKey="name"
            value={details.accountName}
            copied={copied}
            onCopy={() => copy("name", details.accountName)}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <button
            type="button"
            onClick={close}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}

function DetailRow({
  label,
  copyKey,
  value,
  copied,
  onCopy,
}: {
  label: string;
  copyKey: string;
  value: string;
  copied: string | null;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </span>
        {value ? (
          <button
            type="button"
            onClick={onCopy}
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            {copied === copyKey ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
      <p className="mt-0.5 font-mono text-[var(--foreground)]">{value || "—"}</p>
    </div>
  );
}
