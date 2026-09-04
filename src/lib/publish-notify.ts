export function shouldNotifySubscribers(
  formData: FormData,
  publish: boolean,
  wasPublished = false
): boolean {
  return publish && !wasPublished && formData.get("notify_subscribers") === "1";
}