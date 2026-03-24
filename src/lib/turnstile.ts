/**
 * Server-side verification for Cloudflare Turnstile.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return true;
  }
  if (!token?.trim()) {
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}
