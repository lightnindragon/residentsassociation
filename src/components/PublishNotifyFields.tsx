"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { formatUkDate } from "@/lib/date-format";
import { sendToSignUps } from "@/app/admin/actions/notify-signups";
import type { PublishActionResult, SignUpNotifyKind } from "@/lib/publish-notify";

export function toastPublishResult(state: NonNullable<PublishActionResult>, savedLabel: string) {
  if (state.error) {
    toast.error(state.error);
    return;
  }
  if (!state.ok) return;
  toast.success(savedLabel);
  if (state.notifyError) {
    toast.error(state.notifyError);
    return;
  }
  if (typeof state.sent === "number") {
    toast.success(
      state.sent === 0
        ? "No sign-ups currently opted in for emails."
        : `Emailed ${state.sent} sign-up${state.sent === 1 ? "" : "s"}.`
    );
  }
}

export function PublishNotifyFields({
  defaultPublished,
  notifiedAt,
  submitLabel,
  sendKind,
  sendId,
}: {
  defaultPublished: boolean;
  notifiedAt?: string | null;
  submitLabel: string;
  sendKind?: SignUpNotifyKind;
  sendId?: string;
}) {
  const { pending } = useFormStatus();
  const [published, setPublished] = useState(defaultPublished);
  const [notify, setNotify] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const alreadyNotified = !!notifiedAt;
  const showSendLater =
    defaultPublished && !alreadyNotified && !!sendKind && !!sendId;
  const showNotifyTick = published && !alreadyNotified && !showSendLater;

  return (
    <div className="flex flex-col gap-3">
      {notify && <input type="hidden" name="notify_subscribers" value="1" />}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          value="1"
          checked={published}
          onChange={(e) => {
            setPublished(e.target.checked);
            if (!e.target.checked) {
              setNotify(false);
              setConfirmingSave(false);
            }
          }}
        />
        <span className="text-sm">Published (visible on site)</span>
      </label>

      {showNotifyTick && (
        <label className="flex items-start gap-2 pl-6">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => {
              setNotify(e.target.checked);
              setConfirmingSave(false);
            }}
            className="mt-0.5"
          />
          <span className="text-sm">
            Send to all sign-ups
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              Emails approved residents who asked for news and updates. This can
              take a minute.
            </span>
          </span>
        </label>
      )}

      {alreadyNotified && notifiedAt && (
        <p className="pl-6 text-xs text-[var(--color-muted)]">
          Sign-ups were emailed on {formatUkDate(notifiedAt)}.
        </p>
      )}

      {showSendLater && sendKind && sendId && (
        <SendToSignUpsButton kind={sendKind} id={sendId} />
      )}

      {confirmingSave ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Send this to all sign-ups?
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Approved residents who opted in for email updates will be notified.
            Keep this tab open until it finishes.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Confirm and save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirmingSave(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type={notify ? "button" : "submit"}
          disabled={pending}
          onClick={
            notify
              ? () => setConfirmingSave(true)
              : undefined
          }
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      )}
    </div>
  );
}

export function SendToSignUpsButton({
  kind,
  id,
}: {
  kind: SignUpNotifyKind;
  id: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (confirming) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Send to all sign-ups?
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          This emails approved residents who opted in for updates. Keep this tab
          open until it finishes. You cannot undo the send.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              start(async () => {
                const res = await sendToSignUps(kind, id);
                if (res.ok) {
                  toast.success(
                    res.sent === 0
                      ? "No sign-ups currently opted in for emails."
                      : `Sent to ${res.sent} sign-up${res.sent === 1 ? "" : "s"}.`
                  );
                  setConfirming(false);
                  router.refresh();
                } else {
                  toast.error(res.error || "Could not send.");
                }
              });
            }}
          >
            {pending ? "Sending…" : "Confirm send"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
      Send to all sign-ups
    </Button>
  );
}
