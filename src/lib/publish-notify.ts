export type SignUpNotifyKind = "news" | "planning" | "event" | "agenda" | "minutes";

export function shouldNotifySubscribers(
  formData: FormData,
  publish: boolean,
  alreadyNotified = false
): boolean {
  return publish && !alreadyNotified && formData.get("notify_subscribers") === "1";
}