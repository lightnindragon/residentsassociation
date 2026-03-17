import { neon, NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL client. Use in Server Components or Server Actions.
 * Set DATABASE_URL in .env (local) or Vercel Environment Variables.
 */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env or Vercel environment variables."
    );
  }
  return neon(url);
}
