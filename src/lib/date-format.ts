/** UK day/month/year — avoids US-style dates when the server default locale is en-US. */
const LOCALE = "en-GB" as const;
const TIME_ZONE = "Europe/London" as const;

function toDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

/** e.g. 27/03/2026 */
export function formatUkDate(input: Date | string | number): string {
  return toDate(input).toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** e.g. 27/03/2026, 14:30 */
export function formatUkDateTime(input: Date | string | number): string {
  return toDate(input).toLocaleString(LOCALE, {
    timeZone: TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  });
}
