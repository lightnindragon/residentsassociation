import type { NotifySignUpsResult } from "@/lib/notify-blog";

export type SignUpNotifyKind = "news" | "planning" | "event" | "agenda" | "minutes";

export type PublishActionResult = {
  ok?: boolean;
  error?: string;
  sent?: number;
  notifyError?: string;
} | null;

export function shouldNotifySubscribers(
  formData: FormData,
  publish: boolean,
  alreadyNotified = false
): boolean {
  return publish && !alreadyNotified && formData.get("notify_subscribers") === "1";
}

export async function runPublishNotify(params: {
  formData: FormData;
  publish: boolean;
  alreadyNotified?: boolean;
  send: () => Promise<NotifySignUpsResult>;
  markSent: () => Promise<unknown>;
}): Promise<{ sent?: number; notifyError?: string }> {
  if (
    !shouldNotifySubscribers(
      params.formData,
      params.publish,
      params.alreadyNotified ?? false
    )
  ) {
    return {};
  }
  const notified = await params.send();
  if (notified.sent > 0) await params.markSent();
  if (notified.error) return { sent: notified.sent, notifyError: notified.error };
  return { sent: notified.sent };
}
