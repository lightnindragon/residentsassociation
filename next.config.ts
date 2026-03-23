import type { NextConfig } from "next";

function hostnameFromEnvUrl(key: string): string | null {
  const raw = process.env[key]?.trim();
  if (!raw?.startsWith("http")) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const extraHosts = [
  ...new Set(
    [
      hostnameFromEnvUrl("NEXTAUTH_URL"),
      hostnameFromEnvUrl("NEXT_PUBLIC_SITE_URL"),
    ].filter((h): h is string => Boolean(h)),
  ),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  images: {
    remotePatterns: [
      // Legacy / docs example host (rare)
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // Actual Vercel Blob URLs: https://<storeId>.public.blob.vercel-storage.com/...
      // Without this, next/image returns 400 for optimized remote images.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      ...extraHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**" as const,
      })),
    ],
  },
};

export default nextConfig;
