import type { NotifySignUpsResult } from "@/lib/notify-blog";

export type SignUpNotifyKind = "news" | "planning" | "event" | "agenda" | "minutes";

export type PublishActionResult = {
  ok?: boolean;
  error?: string;
  sent?: number;
  notifyError?: string;
  alreadySent?: boolean;
} | null;

export function shouldNotifySubscribers(
  formData: FormData,
  publish: boolean,
  alreadyNotified = false
): boolean {
  return publish && !alreadyNotified && formData.get("notify_subscribers") === "1";
}

/** Claim the send first so a second click cannot email the same item again. */
export async function runPublishNotify(params: {
  formData: FormData;
  publish: boolean;
  alreadyNotified?: boolean;
  send: () => Promise<NotifySignUpsResult>;
  claimSent: () => Promise<boolean>;
}): Promise<{ sent?: number; notifyError?: string; alreadySent?: boolean }> {
  if (
    !shouldNotifySubscribers(
      params.formData,
      params.publish,
      params.alreadyNotified ?? false
    )
  ) {
    return {};
  }
  const claimed = await params.claimSent();
  if (!claimed) return { alreadySent: true };
  const notified = await params.send();
  if (notified.error) return { sent: notified.sent, notifyError: notified.error, alreadySent: true };
  return { sent: notified.sent, alreadySent: true };
}
