/**
 * SMTP password encryption secret. Use bracket access so Next.js does not
 * substitute a build-time empty value when the var was added after an older deploy.
 */
export function getEncryptionKey(): string | undefined {
  const raw =
    process.env["ENCRYPTION_KEY"] ?? process.env["SMTP_ENCRYPTION_KEY"];
  const trimmed = raw?.trim();
  return trimmed || undefined;
}
