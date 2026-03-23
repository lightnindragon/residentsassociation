/**
 * Header logo: defaults to static asset; set NEXT_PUBLIC_SITE_LOGO_URL when serving from Vercel Blob (public store).
 */
export function getHeaderLogoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_LOGO_URL?.trim();
  if (fromEnv) return fromEnv;
  return "/branding/site-logo.jpeg";
}
