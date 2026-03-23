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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
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
