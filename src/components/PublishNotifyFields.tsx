"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
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
  if (typeof state.sent === "number") {
    toast.success(
      state.sent === 0
        ? "Saved. No sign-ups currently opted in — this will not be sent again."
        : `Sent to ${state.sent} sign-up${state.sent === 1 ? "" : "s"}.`
    );
    toast.success(savedLabel);
    if (state.notifyError) toast.error(state.notifyError);
    return;
  }
  if (state.alreadySent) {
    toast.success("Already sent. This will not be emailed again.");
    toast.success(savedLabel);
    return;
  }
  toast.success(savedLabel);
}

export function useOnceFormSubmit(opts: { error?: string; unlock?: boolean } = {}) {
  const submitted = useRef(false);
  useEffect(() => {
    if (opts.error || opts.unlock) submitted.current = false;
  }, [opts.error, opts.unlock]);
  return (e: FormEvent<HTMLFormElement>) => {
    if (submitted.current) {
      e.preventDefault();
      return;
    }
    submitted.current = true;
  };
}

function SentNotice({
  sent,
  notifiedAt,
  alreadySent,
}: {
  sent?: number;
  notifiedAt?: string | null;
  alreadySent?: boolean;
}) {
  const countLabel =
    typeof sent === "number"
      ? sent === 0
        ? "No sign-ups were opted in."
        : `Emailed ${sent} sign-up${sent === 1 ? "" : "s"}.`
      : notifiedAt
        ? `Sign-ups were emailed on ${formatUkDate(notifiedAt)}.`
        : "Sign-ups have already been emailed about this.";
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/40">
      <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">Sent</p>
      <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-200">
        {alreadySent && typeof sent !== "number"
          ? "Already sent. This will not be emailed again."
          : `${countLabel} This will not be sent again.`}
      </p>
    </div>
  );
}

export function PublishNotifyFields({
  defaultPublished,
  notifiedAt,
  submitLabel,
  sendKind,
  sendId,
  sentNotice,
  saveComplete,
}: {
  defaultPublished: boolean;
  notifiedAt?: string | null;
  submitLabel: string;
  sendKind?: SignUpNotifyKind;
  sendId?: string;
  sentNotice?: { sent?: number; alreadySent?: boolean } | null;
  saveComplete?: boolean;
}) {
  const { pending } = useFormStatus();
  const [published, setPublished] = useState(defaultPublished);
  const [notify, setNotify] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const alreadyNotified = !!notifiedAt || !!sentNotice;
  const showSendLater =
    defaultPublished && !alreadyNotified && !!sendKind && !!sendId;
  const showNotifyTick = published && !alreadyNotified && !showSendLater && !pending;

  return (
    <div className="flex flex-col gap-3">
      {notify && !alreadyNotified && <input type="hidden" name="notify_subscribers" value="1" />}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          value="1"
          checked={published}
          disabled={pending}
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

      {alreadyNotified && (
        <SentNotice
          sent={sentNotice?.sent}
          notifiedAt={notifiedAt}
          alreadySent={sentNotice?.alreadySent}
        />
      )}

      {showNotifyTick && (
        <label className="flex items-start gap-2 pl-6">
          <input
            type="checkbox"
            checked={notify}
            disabled={pending}
            onChange={(e) => {
              setNotify(e.target.checked);
              setConfirmingSave(false);
            }}
            className="mt-0.5"
          />
          <span className="text-sm">
            Send to all sign-ups
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              Emails approved residents who asked for news and updates. Only
              sent once.
            </span>
          </span>
        </label>
      )}

      {showSendLater && sendKind && sendId && (
        <SendToSignUpsButton kind={sendKind} id={sendId} />
      )}

      {confirmingSave && !alreadyNotified ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Send this to all sign-ups?
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            This emails opted-in residents once. Extra clicks will not send
            again. Keep this tab open until you see Sent.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" disabled={pending || saveComplete}>
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
        !alreadyNotified && (
          <Button
            type={notify ? "button" : "submit"}
            disabled={pending || saveComplete}
            onClick={
              notify
                ? () => setConfirmingSave(true)
                : undefined
            }
          >
            {pending ? "Saving…" : saveComplete ? "Saved" : submitLabel}
          </Button>
        )
      )}

      {alreadyNotified && (
        <Button type="submit" disabled={pending || saveComplete}>
          {pending ? "Saving…" : saveComplete ? "Saved" : submitLabel}
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
  const startedRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ sent?: number; alreadySent?: boolean } | null>(null);

  if (done) {
    return <SentNotice sent={done.sent} alreadySent={done.alreadySent} />;
  }

  if (confirming) {
    const busy = pending || started;
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Send to all sign-ups?
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          This emails opted-in residents once. After it is sent, further clicks
          will not send again.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              if (startedRef.current) return;
              startedRef.current = true;
              setStarted(true);
              start(async () => {
                const res = await sendToSignUps(kind, id);
                if (res.ok || res.alreadySent) {
                  setDone({ sent: res.sent, alreadySent: true });
                  if (res.error) {
                    toast.error(res.error);
                  } else {
                    toast.success(
                      res.alreadySent && typeof res.sent !== "number"
                        ? "Already sent. This will not be emailed again."
                        : res.sent === 0
                          ? "No sign-ups currently opted in. This will not be sent again."
                          : `Sent to ${res.sent} sign-up${res.sent === 1 ? "" : "s"}.`
                    );
                  }
                  router.refresh();
                } else {
                  startedRef.current = false;
                  setStarted(false);
                  toast.error(res.error || "Could not send.");
                }
              });
            }}
          >
            {busy ? "Sending…" : "Confirm send"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
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
