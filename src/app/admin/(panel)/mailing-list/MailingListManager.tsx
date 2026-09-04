"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addMailingListSubscriber,
  addWebsiteUsersToMailingList,
  deleteMailingListSubscriber,
  importMailingListCsv,
  updateMailingListSubscriber,
} from "@/app/admin/actions/mailing-list";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";
import { formatUkDate } from "@/lib/date-format";
import type { MailingListRow } from "./page";

const SOURCE_LABEL: Record<string, string> = {
  manual: "Added",
  import: "Imported",
  website: "Website",
};

export function MailingListManager({ subscribers }: { subscribers: MailingListRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [syncing, startSync] = useTransition();

  return (
    <div className="mt-6 space-y-8">
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/mailing-list/export"
          className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm font-medium hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-muted)]/30"
        >
          Export CSV
        </a>
        <Button
          type="button"
          variant="secondary"
          disabled={syncing}
          onClick={() => {
            startSync(async () => {
              const res = await addWebsiteUsersToMailingList();
              if (res.ok) {
                toast.success(
                  res.added === 0
                    ? "No new website users to add."
                    : `Added ${res.added} website user${res.added === 1 ? "" : "s"}.`
                );
              } else {
                toast.error(res.error || "Could not add website users.");
              }
            });
          }}
        >
          {syncing ? "Adding…" : "Add approved website users"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddForm />
        <ImportForm />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">Name</th>
              <th className="py-3 text-left font-medium">Email</th>
              <th className="py-3 text-left font-medium">Source</th>
              <th className="py-3 text-left font-medium">Added</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-muted)]">
                  No one on the mailing list yet.
                </td>
              </tr>
            ) : (
              subscribers.map((s) =>
                editingId === s.id ? (
                  <tr key={s.id} className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
                    <td colSpan={5} className="py-3">
                      <EditRow
                        subscriber={s}
                        onDone={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id} className="border-b border-[var(--color-border)]">
                    <td className="py-3 font-medium">{s.name || "—"}</td>
                    <td className="py-3 text-[var(--color-muted)]">{s.email}</td>
                    <td className="py-3">{SOURCE_LABEL[s.source] ?? s.source}</td>
                    <td className="py-3 text-[var(--color-muted)]">{formatUkDate(s.created_at)}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="text-[var(--color-primary)] hover:underline"
                        onClick={() => setEditingId(s.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-red-700 hover:underline"
                        disabled={pendingId === s.id}
                        onClick={async () => {
                          if (!confirm(`Remove ${s.email} from the mailing list?`)) return;
                          setPendingId(s.id);
                          const res = await deleteMailingListSubscriber(s.id);
                          setPendingId(null);
                          if (res.ok) toast.success("Removed from mailing list.");
                          else toast.error(res.error || "Could not remove.");
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddForm() {
  const [state, formAction] = useActionState(addMailingListSubscriber, null);
  const last = useRef<typeof state>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      toast.success("Person added to the mailing list.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm"
    >
      <h2 className="font-heading text-lg font-semibold">Add person</h2>
      <div className="mt-3 flex flex-col gap-3">
        <Input label="Name" name="name" placeholder="Optional" />
        <Input label="Email" name="email" type="email" required />
        <Input label="Notes" name="notes" placeholder="Optional" />
        <Button type="submit">Add to list</Button>
      </div>
    </form>
  );
}

function ImportForm() {
  const [state, formAction] = useActionState(importMailingListCsv, null);
  const last = useRef<typeof state>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      toast.success(
        `Imported ${state.added ?? 0} people` +
          (state.skipped ? `, skipped ${state.skipped} duplicate or invalid rows.` : ".")
      );
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm"
    >
      <h2 className="font-heading text-lg font-semibold">Import CSV</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Use columns <strong>Name</strong> and <strong>Email</strong> (optional Notes). Existing
        emails are skipped.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm"
        />
        <Button type="submit" variant="outline">
          Import spreadsheet
        </Button>
      </div>
    </form>
  );
}

function EditRow({
  subscriber,
  onDone,
  onCancel,
}: {
  subscriber: MailingListRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const bound = (prev: unknown, formData: FormData) =>
    updateMailingListSubscriber(subscriber.id, prev, formData);
  const [state, formAction] = useActionState(bound, null);
  const last = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      toast.success("Subscriber updated.");
      onDone();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [onDone, state]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-3">
      <Input label="Name" name="name" defaultValue={subscriber.name} />
      <Input label="Email" name="email" type="email" defaultValue={subscriber.email} required />
      <Input label="Notes" name="notes" defaultValue={subscriber.notes ?? ""} />
      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit">Save</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}